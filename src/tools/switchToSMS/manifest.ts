import { ToolManifest } from '../../lib/types';

export const switchToSMSManifest: ToolManifest = {
  type: 'function',
  function: {
    name: 'switchToSMS',
    description: 'Switch the conversation from voice call to SMS/text messaging. Use this when the user indicates they cannot hear well, have audio problems, or would prefer to continue via text messages.',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Brief reason for switching to SMS (e.g., "poor audio quality", "user request")',
        },
        message: {
          type: 'string',
          description: 'The message to send via SMS to continue the conversation',
        },
      },
      required: ['message'],
    },
  },
};
