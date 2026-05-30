// backend/src/middleware/authMiddleware.ts

import type { NextFunction, Request, Response } from 'express';
import { getMembership, getTeamById } from '../models/teamModel';
import { getTaskForUser } from '../models/taskModel';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }

  return res.status(401).json({ message: 'Authentication required' });
};

export const requireTeamCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.id as string;
    const team = await getTeamById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.created_by !== req.user?.id) {
      return res.status(403).json({ message: 'Only the team creator can do this' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = String(req.params.id || req.body.team_id || req.query.team_id || '');

    if (!teamId) {
      return res.status(400).json({ message: 'team_id is required' });
    }

    const membership = await getMembership(teamId, req.user!.id);

    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireTaskCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await getTaskForUser(req.params.id as string, req.user!.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.created_by !== req.user!.id) {
      return res.status(403).json({ message: 'Only the task creator can delete this task' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
