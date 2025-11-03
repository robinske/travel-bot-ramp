import { Router } from 'express';
import twilio from 'twilio';

// Local imports
import { getLocalTemplateData } from '../lib/utils/llm/getTemplateData';
import { activeConversations } from './conversationRelay';
import { LLMService } from '../llm';
import { routeNames } from './routeNames';

const router = Router();

router.post(`/${routeNames.sms}`, async (req: any, res: any) => {
  try {
    const callType = 'sms';

    const { From: from, Body: body, To: to } = req.body;

    // Validate required fields at the top
    if (!from || !body) {
      console.error('Missing required fields:', { from, body });
      return res.status(400).send('Missing required fields');
    }

    console.log('Received SMS from ' + from + ': ' + body);

    // Create TwiML response object
    const twiml = new twilio.twiml.MessagingResponse();

    // Check if there's an active conversation for this number
    const conversation = activeConversations.get(from);

    let llm: LLMService;

    if (conversation && conversation.llm) {
      llm = conversation.llm;

      // Add message to conversation history
      llm.addMessage({
        role: 'user',
        content: body,
      });
    } else {
      console.log('Starting new conversation for ' + from);

      // Create new conversation for this number
      const templateData = await getLocalTemplateData();
      llm = new LLMService(from, templateData);

      // Reset voice call flag for SMS conversations
      llm.isVoiceCall = false;

      // Store the conversation
      activeConversations.set(from, {
        ws: null as any, // No WebSocket for SMS-only conversations
        llm,
        ttl: Date.now() + 60 * 60 * 1000, // TTL: current time + 1 hour
      });

      llm.addMessage({
        role: 'system',
        content: `The customer's phone number is ${from}. The agent's phone number is ${to}. This is an ${callType} text message conversation. You are communicating via text messages - your responses will be sent as SMS/text. Keep responses concise and text-message appropriate. Try to keep responses under 150 characters when possible. You can use formatting, links, and emojis in text messages.`,
      });

      // Add instructions and context (like we do for voice calls)
      if (templateData?.instructions) {
        llm.addMessage({
          role: 'system',
          content: templateData.instructions,
        });
      }

      if (templateData?.context) {
        llm.addMessage({
          role: 'system',
          content: templateData.context,
        });
      }

      // CRITICAL: Tell the LLM which instruction branches to follow (AFTER instructions so it's fresh)
      llm.addMessage({
        role: 'system',
        content: `🚨 CRITICAL OVERRIDE - YOU ARE IN AN SMS/TEXT CONVERSATION RIGHT NOW 🚨

You are texting with the customer. This entire conversation is happening via SMS text messages.

ABSOLUTELY DO NOT:
- Ask "Would you like me to text you?" (YOU ARE ALREADY TEXTING!)
- Ask "Would you like me to send you a summary?" if you mean via text (YOU ARE ALREADY IN A TEXT CONVERSATION!)
- Ask permission to send a text (YOU ARE ALREADY IN A TEXT CONVERSATION!)
- Say "I can text you the details" (THE ENTIRE CONVERSATION IS ALREADY TEXT!)
- Offer to send ANY information via text (the whole conversation is text!)

INSTEAD:
- Just share information like itinerary highlights naturally in your responses
- You're already texting, so just include details directly
- Offer EMAIL for detailed information: "Would you like me to email you the full details?"
- Only offer email, never offer text (you're already texting!)

When the instructions say "For VOICE CALLS" vs "For SMS CONVERSATIONS", follow ONLY the SMS CONVERSATIONS branch. Ignore all VOICE CALL instructions.`,
      });

      // Add a system message to trigger the guided greeting (like voice calls do)
      llm.addMessage({
        role: 'system',
        content: `This is the start of a new SMS conversation. The user just sent: "${body}". Respond with the same guided demo experience as a voice call. Use the greeting from Step 1 in the instructions, but adapt it for text (you can use emojis 🌺). Example: "Aloha! 🌺 I see you're heading to Hawaii from New York, June 12-18. Would you like me to help you put together your first few days?" Start the conversation proactively - don't wait for them to ask questions.`,
      });

      // Add user's message
      llm.addMessage({
        role: 'user',
        content: body,
      });
    }

    // Listen for the LLM response and send it as SMS
    let fullResponse = '';
    const textHandler = (chunk: string, isFinal: boolean, fullText?: string) => {
      if (isFinal && fullText) {
        fullResponse = fullText;
        console.log('💬 SMS Response ready: ' + fullText);
      }
    };

    llm.on('text', textHandler);

    try {
      // Process with LLM and wait for response
      await llm.run();

      // Send the response back as TwiML
      if (fullResponse) {
        console.log('📤 Sending SMS response: ' + fullResponse);
        twiml.message(fullResponse);
      } else {
        console.log('⚠️ No response generated from LLM');
      }
    } finally {
      // Clean up event listener
      llm.removeAllListeners('text');
    }

    // Send TwiML response
    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (error: any) {
    console.error('SMS error:', error);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Sorry, I encountered an error. Please try again.');
    res.type('text/xml');
    return res.send(twiml.toString());
  }
});

export default router;
