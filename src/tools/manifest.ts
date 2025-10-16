import { sendTextManifest } from './sendText/manifest';
import { sendRCSManifest } from './sendRCS/manifest';
import { sendEmailManifest } from './sendEmail/manifest';
// import { getSegmentProfileManifest } from './getSegmentProfile/manifest';
// import { getSegmentEventsManifest } from './getSegmentEvents/manifest';
// import { updateSegmentProfileManifest } from './updateSegmentProfile/manifest';
import { postSegmentTrackManifest } from './postSegmentTrack/manifest';
// import { getAirtableDataManifest } from './getAirtableData/manifest';
// import { upsertAirtableDataManifest } from './upsertAirtableData/manifest';
import { sendToLiveAgentManifest } from './sendToLiveAgent/manifest';
import { switchLanguageManifest } from './switchLanguage/manifest';
import { ToolManifest } from '../lib/types';

// Build tools object conditionally based on environment variables
const baseTools: Record<string, { manifest: ToolManifest }> = {
  sendText: {
    manifest: sendTextManifest,
  },
  sendRCS: {
    manifest: sendRCSManifest,
  },
  sendEmail: {
    manifest: sendEmailManifest,
  },
  sendToLiveAgent: {
    manifest: sendToLiveAgentManifest,
  },
  switchLanguage: {
    manifest: switchLanguageManifest,
  },
};

// // Add Segment tools only if configured
// const segmentConfigured = process.env.SEGMENT_SPACE && process.env.SEGMENT_TOKEN;
// const segmentTools = segmentConfigured ? {
//   getSegmentProfile: {
//     manifest: getSegmentProfileManifest,
//   },
//   getSegmentEvents: {
//     manifest: getSegmentEventsManifest,
//   },
//   updateSegmentProfile: {
//     manifest: updateSegmentProfileManifest,
//   },
//   postSegmentTrack: {
//     manifest: postSegmentTrackManifest,
//   },
// } : {};

// // Add Airtable tools only if configured
// const airtableConfigured = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID;
// const airtableTools = airtableConfigured ? {
//   getAirtableData: {
//     manifest: getAirtableDataManifest,
//   },
//   upsertAirtableData: {
//     manifest: upsertAirtableDataManifest,
//   },
// } : {};

export const tools: Record<string, { manifest: ToolManifest }> = {
  ...baseTools,
  // ...segmentTools,
  // ...airtableTools,
};
