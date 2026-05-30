// backend/src/routes/taskRoutes.ts

import { Router } from 'express';
import {
  createNewTask,
  deleteTask,
  getDueSoon,
  getTask,
  getTasks,
  updateExistingTask,
} from '../controllers/taskController';
import { requireTaskCreator, requireTeamMember } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
  updateTaskSchema,
} from '../validators/taskValidator';

export const taskRoutes = Router();

taskRoutes.get('/', validate(taskQuerySchema, 'query'), getTasks);
taskRoutes.get('/reminders/due-soon', getDueSoon);
taskRoutes.post('/', validate(createTaskSchema), requireTeamMember, createNewTask);
taskRoutes.get('/:id', validate(taskIdParamSchema, 'params'), getTask);
taskRoutes.put('/:id', validate(taskIdParamSchema, 'params'), validate(updateTaskSchema), updateExistingTask);
taskRoutes.delete('/:id', validate(taskIdParamSchema, 'params'), requireTaskCreator, deleteTask);
