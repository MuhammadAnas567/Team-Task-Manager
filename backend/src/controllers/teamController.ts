// backend/src/controllers/teamController.ts

import type { NextFunction, Request, Response } from 'express';
import { findUserByEmail } from '../models/userModel';
import {
  addTeamMember,
  createTeamWithCreator,
  deleteTeamById,
  getTeamForUser,
  getTeamMembers,
  getTeamsForUser,
  removeTeamMember,
  updateTeamName,
} from '../models/teamModel';

type TeamBody = {
  name: string;
};

type AddMemberBody = {
  email: string;
};

export const getTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await getTeamsForUser(req.user!.id);
    return res.json({ teams });
  } catch (error) {
    return next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TeamBody;
    const team = await createTeamWithCreator(name, req.user!.id);
    return res.status(201).json({ team });
  } catch (error) {
    return next(error);
  }
};

export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.id as string;
    const team = await getTeamForUser(teamId, req.user!.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const members = await getTeamMembers(teamId);
    return res.json({ team, members });
  } catch (error) {
    return next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TeamBody;
    const team = await updateTeamName(req.params.id as string, name);
    return res.json({ team });
  } catch (error) {
    return next(error);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTeamById(req.params.id as string);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as AddMemberBody;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(422).json({
        message: 'No account exists with this email. Ask them to register first, or use invite stub.',
      });
    }

    if (user.id === req.user!.id) {
      return res.status(400).json({ message: 'You are already the creator of this team' });
    }

    const member = await addTeamMember(req.params.id as string, user.id, 'member');
    return res.status(201).json({ member });
  } catch (error) {
    return next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.id as string;
    const userId = req.params.userId as string;

    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Team creator cannot be removed' });
    }

    await removeTeamMember(teamId, userId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  const { email } = req.body as AddMemberBody;
  console.log(`Stub invite sent to ${email} for team ${req.params.id} by user ${req.user!.id}`);

  return res.json({
    success: true,
    message: `Invite sent to ${email}`,
  });
};
