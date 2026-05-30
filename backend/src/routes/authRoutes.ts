// backend/src/routes/authRoutes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me, register } from '../controllers/authController';
import { isAuthenticated } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { loginSchema, registerSchema } from '../validators/authValidator';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please try again later.' },
});

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), register);
authRoutes.post('/login', authLimiter, validate(loginSchema), login);
authRoutes.post('/logout', isAuthenticated, logout);
authRoutes.get('/me', isAuthenticated, me);
