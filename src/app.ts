import 'dotenv/config';
import express from 'express';
import ExpressWs from 'express-ws';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

// Local imports
import { log } from './lib/utils/logger';
import { setupConversationRelayRoute } from './routes/conversationRelay';
import callRouter from './routes/call';
import smsRouter from './routes/sms';
import statsRouter from './routes/stats';
import { preloadTemplateData } from './lib/utils/llm/getTemplateData';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const { app } = ExpressWs(express());

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));

// Configure CORS based on environment
if (process.env.NODE_ENV !== 'production') {
  // In development, allow localhost:3000 to talk to localhost:3001
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
} else {
  // In production, allow your frontend domain
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
}

app.use(express.urlencoded({ extended: true })).use(express.json());

// Serve static files from public directory
// In dev mode: __dirname is src, so ../public
// In production: __dirname is dist/src, so ../../public
const publicPath = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../public')
  : path.join(__dirname, '../../public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Set up WebSocket route for conversation relay
setupConversationRelayRoute(app);

// Set up HTTP routes
app.use('/', callRouter);
app.use('/', smsRouter);
app.use('/', statsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Preload template data before starting server
preloadTemplateData()
  .then(() => {
    app.listen(PORT, () => {
      const model = process.env.OPENAI_MODEL || 'gpt-4.1';
      console.log('🤖 OpenAI Model:', model);
      log.info({
        label: 'server',
        message: `Server listening on port ${PORT}`,
      });
    });
  })
  .catch((error) => {
    console.error('Failed to preload template data:', error);
    // Start server anyway with fallback behavior
    app.listen(PORT, () => {
      const model = process.env.OPENAI_MODEL || 'gpt-4.1';
      console.log('🤖 OpenAI Model:', model);
      log.info({
        label: 'server',
        message: `Server listening on port ${PORT} (template data preload failed)`,
      });
    });
  });
