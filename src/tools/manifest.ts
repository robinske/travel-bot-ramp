import { sendTextManifest } from './sendText/manifest';
import { sendEmailManifest } from './sendEmail/manifest';
import { switchLanguageManifest } from './switchLanguage/manifest';
import { switchToSMSManifest } from './switchToSMS/manifest';
import { ToolManifest } from '../lib/types';

export const tools: Record<string, { manifest: ToolManifest }> = {
  sendText: {
    manifest: sendTextManifest,
  },
  sendEmail: {
    manifest: sendEmailManifest,
  },
  switchLanguage: {
    manifest: switchLanguageManifest,
  },
  switchToSMS: {
    manifest: switchToSMSManifest,
  },
};
