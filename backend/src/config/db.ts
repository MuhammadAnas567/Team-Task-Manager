// backend/src/config/db.ts

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/team_task_manager';

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in production');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
};

export const ensureDatabase = connectDatabase;

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
