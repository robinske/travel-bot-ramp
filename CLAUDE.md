# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- **Start development server**: `npm run dev`
- **Start development server with ngrok**: `npm run dev:with-ngrok`
- **Build project**: `npm run build`
- **Start production server**: `npm start`
- **Install ngrok globally**: `npm run ngrok:install`
- **Start ngrok tunnel**: `ngrok http 3000`
- **Run Twilio setup scripts**: `npm run twilio:init`

### Environment Setup

1. Create an `.env` file based on `.env.example`
2. Required environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `OPENAI_API_KEY`
   - `SERVICE_NAME`
   - `NGROK_URL` or `LIVE_HOST_URL` (for webhook URLs)
   - Optional service credentials for Segment, Airtable, SendGrid, etc.

## Architecture

### Core Components

1. **Express Server**: The application is built on Express with WebSocket support via express-ws.
   - Main entry point: `src/app.ts`
   - Sets up HTTP routes and WebSocket handlers
   - Configures middleware and server settings

2. **ConversationRelay**: Handles voice call integration with Twilio.
   - Core implementation: `src/routes/conversationRelay.ts`
   - Manages WebSocket connections to Twilio
   - Tracks active conversations and manages their lifecycle

3. **LLM Service**: Manages interactions with OpenAI's API.
   - Implementation: `src/llm.ts`
   - Handles conversation context and message history
   - Processes tool calls from the LLM
   - Streams responses with support for interruptions

4. **Tool System**: Modular architecture for agent capabilities.
   - Tool registry: `src/tools/manifest.ts`
   - Tool execution: `src/tools/executors.ts`
   - Each tool has:
     - `manifest.ts`: OpenAI function definition
     - `executor.ts`: Implementation logic

5. **Routing**: Express routes for different endpoints.
   - Voice calls: `src/routes/call.ts`
   - SMS: `src/routes/sms.ts`
   - Live agent integration: `src/routes/liveAgent.ts`
   - Additional endpoints for stats, outbound communications, etc.

### Agent Customization

1. **Instructions**: `src/lib/prompts/instructions.md`
   - Defines agent behavior, personality, and capabilities
   - Loaded at runtime by `getTemplateData()`

2. **Context**: `src/lib/prompts/context.md`
   - Provides system-level context about the application
   - Loaded at runtime by `getTemplateData()`

## Tool System

The agent supports multiple tools that extend its capabilities:

1. **Communication Tools**:
   - `sendText`: Send SMS messages
   - `sendRCS`: Send RCS messages
   - `sendEmail`: Send emails via SendGrid

2. **Integration Tools**:
   - `getSegmentProfile`: Retrieve customer profiles from Segment
   - `getSegmentEvents`: Get customer events from Segment
   - `updateSegmentProfile`: Update customer profiles in Segment
   - `postSegmentTrack`: Send tracking events to Segment
   - `getAirtableData`: Fetch data from Airtable
   - `upsertAirtableData`: Create or update Airtable records

3. **System Tools**:
   - `sendToLiveAgent`: Transfer call to a live agent
   - `switchLanguage`: Change the conversation language

To add a new tool:
1. Create a new directory in `src/tools/`
2. Add `manifest.ts` with OpenAI function definition
3. Add `executor.ts` with implementation logic
4. Register in `src/tools/manifest.ts` and `src/tools/executors.ts`

## Deployment

The application can be deployed to any Node.js hosting platform:

- **Heroku**: Uses the included `Procfile`
- **Railway**: Deploy directly from Git
- **AWS/GCP/Azure**: Can be deployed as Docker containers or serverless functions
- **Vercel**: Can be deployed as serverless functions

Ensure all environment variables are properly configured in the hosting platform.