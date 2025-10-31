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
    const callType =
      req.body.To.includes('whatsapp:') || req.body.From.includes('whatsapp:')
        ? 'whatsapp'
        : 'sms';

    const { From: from, Body: body, To: to } = req.body;

    // Validate required fields at the top
    if (!from || !body) {
      console.error('Missing required fields:', { from, body });
      return res.status(400).send('Missing required fields');
    }

    console.log('Received SMS from ' + from + ': ' + body);

    // Check if there's an active conversation for this number
    const conversation = activeConversations.get(from);

    if (conversation && conversation.llm) {
      const { llm } = conversation;

      // Add message to conversation history
      llm.addMessage({
        role: 'user',
        content: body,
      });

      // Process with LLM
      await llm.run();
    } else {
      // Create new conversation for this number
      const templateData = await getLocalTemplateData();
      const llm = new LLMService(from, templateData);

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

      // Add user's message and start conversation
      llm.addMessage({
        role: 'user',
        content: body,
      });

      await llm.run();
    }

    // Send TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (error: any) {
    console.error('SMS error:', error);
    return res.status(500).send('Error processing message');
  }
});

export default router;