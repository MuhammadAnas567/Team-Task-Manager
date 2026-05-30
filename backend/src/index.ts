// backend/src/index.ts

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { connectDatabase, mongoUri } from './config/db';
import { configurePassport, passport } from './config/passport';
import { isAuthenticated } from './middleware/authMiddleware';
import { authRoutes } from './routes/authRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { teamRoutes } from './routes/teamRoutes';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const sessionSecret = process.env.SESSION_SECRET ?? 'dev-only-change-this-secret';

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
      sameSite: isProduction ? 'none' : 'lax',
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

app.get('/', (_req, res) => {
  res.redirect(frontendOrigin);
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

const start = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

start().catch((error: Error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
