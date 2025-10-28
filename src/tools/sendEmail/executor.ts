import sgMail from '@sendgrid/mail';
import { ToolResult, LocalTemplateData } from '../../lib/types';

export type SendEmailParams = {
  to: string;
  subject: string;
  content?: string;
  contentVariables?: Record<string, string>;
};

// Helper function to escape HTML entities for SendGrid Handlebars templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

function getToolEnvData(toolData: LocalTemplateData['toolData']) {
  const {
    sendGridApiKey: sendGridApiKeyEnv,
    sendGridDomain: sendGridDomainEnv,
    sendGridTemplateId: sendGridTemplateIdEnv,
  } = process.env;

  return {
    sendGridApiKey: toolData?.sendGridApiKey || sendGridApiKeyEnv,
    sendGridDomain: toolData?.sendGridDomain || sendGridDomainEnv,
    sendGridTemplateId: toolData?.sendGridTemplateId || sendGridTemplateIdEnv,
  };
}

export async function execute(
  args: Record<string, unknown>,
  toolData: LocalTemplateData['toolData']
): Promise<ToolResult> {
  const { to, subject, content, contentVariables } = args as SendEmailParams;
  const { sendGridApiKey, sendGridDomain, sendGridTemplateId } =
    getToolEnvData(toolData);

  try {
    const missingParams: string[] = [];

    if (!sendGridApiKey) {
      missingParams.push('SendGrid API Key (SENDGRID_API_KEY)');
    }

    if (!sendGridDomain) {
      missingParams.push('SendGrid Domain (SENDGRID_DOMAIN)');
    }

    if (!to) {
      missingParams.push('to (email address)');
    }
    if (!subject) {
      missingParams.push('subject');
    }
    if (!content && !contentVariables) {
      missingParams.push('content or contentVariables');
    }

    if (missingParams.length > 0) {
      throw new Error(
        `Missing required parameters: ${missingParams.join(', ')}`
      );
    }

    sgMail.setApiKey(sendGridApiKey!);

    let msg = {} as sgMail.MailDataRequired;

    // Internal email system seem to block Sendgrid
    if (
      sendGridTemplateId &&
      !to.includes('@twilio.com') &&
      !to.includes('@segment.com')
    ) {
      // Escape content for SendGrid Handlebars templates
      const rawContent = contentVariables?.content || content || '';
      const escapedContent = escapeHtml(rawContent);

      msg = {
        to: to!,
        from: sendGridDomain!,
        templateId: sendGridTemplateId!,
        dynamicTemplateData: {
          ...contentVariables,
          content: escapedContent,
          subject,
        },
      };
    } else {
      msg = {
        to: to!,
        from: sendGridDomain!,
        subject: subject!,
        html: `<div>${contentVariables?.content || content}</div>`,
      };
    }

    const result = await sgMail.send(msg);

    return {
      success: true,
      data: { message: 'Email sent successfully', result },
    };
  } catch (err) {
    let errorMessage = 'Failed to send email';
    console.error("________________________________");
    console.error(content)
    console.error('Error in sendEmail executor:', JSON.stringify(err));
    console.error("________________________________");
    errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err) || errorMessage;

    return {
      success: false,
      error: errorMessage,
    };
  }
}