// backend/src/controllers/taskController.ts

import type { NextFunction, Request, Response } from 'express';
import { getMembership } from '../models/teamModel';
import {
  createTask,
  deleteTaskById,
  getDueSoonTasks,
  getTaskForUser,
  getTasksForUser,
  updateTask,
  type TaskCreateInput,
  type TaskFilters,
  type TaskUpdateInput,
} from '../models/taskModel';

const assertAssigneeIsTeamMember = async (teamId: string, assignedTo?: string | null) => {
  if (!assignedTo) {
    return true;
  }

  const membership = await getMembership(teamId, assignedTo);
  return Boolean(membership);
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = (res.locals.validatedQuery ?? req.query) as TaskFilters;
    const tasks = await getTasksForUser(req.user!.id, filters);
    return res.json({ tasks });
  } catch (error) {
    return next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await getTaskForUser(req.params.id as string, req.user!.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ task });
  } catch (error) {
    return next(error);
  }
};

export const createNewTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as Omit<TaskCreateInput, 'created_by'>;
    const canAssign = await assertAssigneeIsTeamMember(input.team_id, input.assigned_to);

    if (!canAssign) {
      return res.status(422).json({ message: 'Assigned user must be a team member' });
    }

    const task = await createTask({ ...input, created_by: req.user!.id });
    return res.status(201).json({ task });
  } catch (error) {
    return next(error);
  }
};

export const updateExistingTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id as string;
    const existingTask = await getTaskForUser(taskId, req.user!.id);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const input = req.body as TaskUpdateInput;
    const canAssign = await assertAssigneeIsTeamMember(existingTask.team_id, input.assigned_to);

    if (!canAssign) {
      return res.status(422).json({ message: 'Assigned user must be a team member' });
    }

    const task = await updateTask(taskId, input);
    return res.json({ task });
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTaskById(req.params.id as string);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const getDueSoon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await getDueSoonTasks(req.user!.id);
    return res.json({ tasks });
  } catch (error) {
    return next(error);
  }
};
