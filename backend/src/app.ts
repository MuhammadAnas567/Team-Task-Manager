// backend/src/app.ts

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { mongoUri } from './config/db';
import { configurePassport, passport } from './config/passport';
import { isAuthenticated } from './middleware/authMiddleware';
import { authRoutes } from './routes/authRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { teamRoutes } from './routes/teamRoutes';

dotenv.config();

export const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendOrigin =
    process.env.FRONTEND_ORIGIN ?? process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? 'http://localhost:5173';
  const sessionSecret = process.env.SESSION_SECRET ?? 'dev-only-change-this-secret';
  const sameSiteCookies = process.env.NETLIFY === 'true' || process.env.COOKIE_SAME_SITE === 'lax';

  configurePassport();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: frontendOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(
    session({
      name: 'ttm.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: isProduction && !sameSiteCookies ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
      store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24 * 7,
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, _res, next) => {
    if (req.path.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '') || '/';
    }
    next();
  });

  app.get('/api/health', async (_req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/teams', isAuthenticated, teamRoutes);
  app.use('/api/tasks', isAuthenticated, taskRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({
      message:
        isProduction || !error.message.includes('ECONNREFUSED')
          ? 'Internal server error'
          : 'Database connection failed. Start MongoDB and verify MONGODB_URI.',
    });
  });

  return app;
};
