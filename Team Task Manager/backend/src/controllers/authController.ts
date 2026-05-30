// backend/src/controllers/authController.ts

import bcrypt from 'bcrypt';
import type { NextFunction, Request, Response } from 'express';
import { passport } from '../config/passport';
import { createUser, findUserByEmail } from '../models/userModel';
import type { User } from '../types';

const SALT_ROUNDS = 12;

type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

const loginRequest = (req: Request, user: Express.User) =>
  new Promise<void>((resolve, reject) => {
    req.login(user, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as RegisterBody;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, passwordHash);

    await loginRequest(req, user);
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    (error: Error | null, user: User | false, info?: { message?: string }) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({ message: info?.message ?? 'Invalid email or password' });
      }

      return req.login(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }

        return res.json({ user });
      });
    },
  )(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    return req.session.destroy((destroyError) => {
      if (destroyError) {
        return next(destroyError);
      }

      res.clearCookie('ttm.sid');
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  });
};

export const me = (req: Request, res: Response) => {
  return res.json({ user: req.user });
};
