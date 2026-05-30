// backend/src/validators/taskValidator.ts

import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const taskIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const taskQuerySchema = Joi.object({
  team_id: objectId,
  assigned_to: objectId,
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  search: Joi.string().trim().max(120),
});

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).required(),
  description: Joi.string().trim().allow('').max(2000),
  status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  team_id: objectId.required(),
  assigned_to: objectId.allow(null),
  due_date: Joi.date().iso().allow(null),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255),
  description: Joi.string().trim().allow('', null).max(2000),
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  assigned_to: objectId.allow(null),
  due_date: Joi.date().iso().allow(null),
}).min(1);
