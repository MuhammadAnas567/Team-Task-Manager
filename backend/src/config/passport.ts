// backend/src/config/passport.ts

import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findUserByEmail, findUserById } from '../models/userModel';
import type { User } from '../types';

export const sanitizeUser = (user: User): Express.User => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const configurePassport = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await findUserByEmail(email.toLowerCase());

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          const validPassword = await bcrypt.compare(password, user.password_hash);

          if (!validPassword) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, sanitizeUser(user));
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await findUserById(id);
      done(null, user ? sanitizeUser(user) : false);
    } catch (error) {
      done(error);
    }
  });
};

export { passport };
