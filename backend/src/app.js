import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import companyRouter from './routes/company.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

  // Basic abuse protection — this app has no auth/accounts, so a simple IP-based
  // limiter is the main defence against someone hammering the FMP quota via us.
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', companyRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export default createApp;
