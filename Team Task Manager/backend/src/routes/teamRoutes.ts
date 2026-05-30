// backend/src/routes/teamRoutes.ts

import { Router } from 'express';
import {
  addMember,
  createTeam,
  deleteTeam,
  getTeam,
  getTeams,
  inviteMember,
  removeMember,
  updateTeam,
} from '../controllers/teamController';
import { requireTeamCreator } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  addMemberSchema,
  createTeamSchema,
  inviteSchema,
  memberParamSchema,
  teamIdParamSchema,
  updateTeamSchema,
} from '../validators/teamValidator';

export const teamRoutes = Router();

teamRoutes.get('/', getTeams);
teamRoutes.post('/', validate(createTeamSchema), createTeam);
teamRoutes.get('/:id', validate(teamIdParamSchema, 'params'), getTeam);
teamRoutes.put(
  '/:id',
  validate(teamIdParamSchema, 'params'),
  validate(updateTeamSchema),
  requireTeamCreator,
  updateTeam,
);
teamRoutes.delete('/:id', validate(teamIdParamSchema, 'params'), requireTeamCreator, deleteTeam);
teamRoutes.post(
  '/:id/members',
  validate(teamIdParamSchema, 'params'),
  validate(addMemberSchema),
  requireTeamCreator,
  addMember,
);
teamRoutes.delete(
  '/:id/members/:userId',
  validate(memberParamSchema, 'params'),
  requireTeamCreator,
  removeMember,
);
teamRoutes.post(
  '/:id/invite',
  validate(teamIdParamSchema, 'params'),
  validate(inviteSchema),
  requireTeamCreator,
  inviteMember,
);
