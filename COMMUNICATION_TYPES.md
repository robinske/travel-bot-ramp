# Communication Type Handling

This application supports both voice calls and SMS/text messaging. The LLM is aware of which communication channel is being used and can adapt its responses accordingly.

## How It Works

### For Voice Calls

When a voice call is initiated via `/call`:
- `llm.isVoiceCall = true`
- System message sent to LLM: "This is a voice call. You are speaking with the customer over the phone - your responses will be read aloud by text-to-speech."
- The LLM knows to avoid markdown, special characters, and keep responses conversational for TTS

### For SMS/Text Messages

When an SMS is received via `/text`:
- `llm.isVoiceCall = false`
- System message sent to LLM: "This is an sms text message conversation. You are communicating via text messages - your responses will be sent as SMS/text. Keep responses concise and text-message appropriate. You can use formatting, links, and emojis in text messages."
- The LLM knows it can use emojis, links, and formatting appropriate for text

## Using Communication Type in Your Code

### In LLM Service

The `LLMService` class provides properties to check the communication type:

```typescript
// Check if voice call
if (llm.isVoiceCall) {
  console.log('This is a voice call');
}

// Get communication type as string
const type = llm.communicationType; // 'voice' | 'sms'
```

### In Tool Executors

Tool executors don't have direct access to the LLM instance, but you can pass the communication type through `toolData` if needed. Alternatively, the LLM's instructions should handle the differences in its prompts.

### Example: Different Behavior Per Channel

You can add conditional logic in your instructions:

```markdown
## Response Style

- For voice calls: Keep responses brief and conversational. Avoid special characters or formatting.
- For SMS: You can use emojis 😊, **bold text**, and include clickable links like https://example.com
```

## System Messages

The following system messages are automatically injected:

### Voice Call
```
This is a {direction} voice call. You are speaking with the customer over the phone - your responses will be read aloud by text-to-speech.
```

### SMS
```
This is an {sms|whatsapp} text message conversation. You are communicating via text messages - your responses will be sent as SMS/text. Keep responses concise and text-message appropriate. You can use formatting, links, and emojis in text messages.
```

## Best Practices

1. **Voice Calls**: Focus on natural speech patterns, avoid characters that sound awkward when read aloud
2. **SMS**: Leverage text-friendly features like emojis, links, and concise formatting
3. **Tools**: Some tools (like `sendText`) work in both channels - consider the current channel when using them
4. **Instructions**: Write channel-specific guidance in your `instructions.md` file
