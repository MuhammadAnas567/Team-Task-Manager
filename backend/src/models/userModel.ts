// backend/src/models/userModel.ts

import { Schema, model, models } from 'mongoose';
import type { User, UserWithPassword } from '../types';

type UserDocument = {
  _id: { toString: () => string };
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    password_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const UserModel = models.User || model<UserDocument>('User', userSchema);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toUser = (document: UserDocument): User => ({
  id: document._id.toString(),
  name: document.name,
  email: document.email,
  created_at: document.created_at,
});

const toUserWithPassword = (document: UserDocument): UserWithPassword => ({
  ...toUser(document),
  password_hash: document.password_hash,
});

export const createUser = async (name: string, email: string, passwordHash: string) => {
  const user = await UserModel.create({ name, email, password_hash: passwordHash });
  return toUser(user);
};

export const findUserByEmail = async (email: string) => {
  const user = await UserModel.findOne({ email }).exec();
  return user ? toUserWithPassword(user) : null;
};

export const findUserByName = async (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const user = await UserModel.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
  }).exec();

  return user ? toUserWithPassword(user) : null;
};

export const findUserById = async (id: string) => {
  const user = await UserModel.findById(id).exec();
  return user ? toUser(user) : null;
};

export const findUsersByIds = async (ids: string[]) => {
  if (!ids.length) {
    return [];
  }

  const users = await UserModel.find({ _id: { $in: ids } }).exec();
  return users.map(toUser);
};

export { UserModel };
