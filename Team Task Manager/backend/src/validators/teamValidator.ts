// backend/src/validators/teamValidator.ts

import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const teamIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const memberParamSchema = Joi.object({
  id: objectId.required(),
  userId: objectId.required(),
});

export const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

export const addMemberSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
});

export const inviteSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
});
