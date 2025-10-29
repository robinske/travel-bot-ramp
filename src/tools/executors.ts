import { execute as sendTextExecute } from './sendText/executor';
import { execute as sendEmailExecute } from './sendEmail/executor';
import { execute as switchLanguageExecute } from './switchLanguage/executor';
import { ToolExecutorParams, ToolResult } from '../lib/types';

export async function executeTool(params: ToolExecutorParams): Promise<ToolResult> {
  const { currentToolName, args, toolData, webhookUrl } = params;
  
  try {
    switch (currentToolName) {
      case 'sendText':
        return await sendTextExecute(args, toolData);
      case 'sendEmail':
        return await sendEmailExecute(args, toolData);
      case 'switchLanguage':
        return await switchLanguageExecute(args, toolData);
      default:
        return {
          success: false,
          error: `Unknown tool: ${currentToolName}`,
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Tool execution failed',
    };
  }
}
