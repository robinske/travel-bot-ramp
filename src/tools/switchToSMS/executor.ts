import { ToolResult, LocalTemplateData } from '../../lib/types';
import twilio from 'twilio';

export type SwitchToSMSParams = {
  reason?: string;
  message: string;
};

export async function execute(
  args: Record<string, unknown>,
  toolData: LocalTemplateData['toolData']
): Promise<ToolResult> {
  const { reason, message } = args as SwitchToSMSParams;

  try {
    const {
      twilioAccountSid,
      twilioAuthToken,
    } = toolData || {};

    // Validate Twilio credentials
    if (!twilioAccountSid || !twilioAuthToken) {
      return {
        success: false,
        error: 'Missing Twilio credentials (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN)',
      };
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      return {
        success: false,
        error: 'Missing Twilio phone number',
      };
    }

    // Get the customer's phone number from toolData
    const customerNumber = (toolData as any)?.customerNumber;
    if (!customerNumber) {
      return {
        success: false,
        error: 'Customer phone number not available',
      };
    }

    // Initialize Twilio client
    const client = twilio(twilioAccountSid, twilioAuthToken);

    // Send SMS to customer
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: customerNumber,
    });

    console.log('Twilio SMS response:', JSON.stringify(response));

    console.log(`📱 Switched to SMS for ${customerNumber}. Reason: ${reason || 'not specified'}`);

    return {
      success: true,
      data: {
        message: 'Successfully switched to SMS conversation',
        reason: reason || 'not specified',
        sentTo: customerNumber,
      },
    };
  } catch (error) {
    console.error('Error switching to SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch to SMS',
    };
  }
}
