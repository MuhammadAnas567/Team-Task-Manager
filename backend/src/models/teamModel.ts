// backend/src/models/teamModel.ts

import { Schema, model } from 'mongoose';
import type { Team, TeamMember, TeamRole } from '../types';
import { findUsersByIds } from './userModel';

type TeamDocument = {
  _id: { toString: () => string };
  name: string;
  created_by: string;
  created_at: Date;
};

type TeamMemberDocument = {
  _id: { toString: () => string };
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: Date;
};

const teamSchema = new Schema<TeamDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    created_by: { type: String, required: true, index: true },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    team_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    role: { type: String, enum: ['creator', 'member'], default: 'member' },
    joined_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

teamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true });

const TeamModel = model<TeamDocument>('Team', teamSchema);
const TeamMemberModel = model<TeamMemberDocument>('TeamMember', teamMemberSchema);

const toTeam = (document: TeamDocument, extras: Partial<Team> = {}): Team => ({
  id: document._id.toString(),
  name: document.name,
  created_by: document.created_by,
  created_at: document.created_at,
  ...extras,
});

const toTeamMember = (document: TeamMemberDocument, extras: Partial<TeamMember> = {}): TeamMember => ({
  id: document._id.toString(),
  team_id: document.team_id,
  user_id: document.user_id,
  role: document.role,
  joined_at: document.joined_at,
  ...extras,
});

export const createTeamWithCreator = async (name: string, userId: string) => {
  const team = await TeamModel.create({ name, created_by: userId });
  await TeamMemberModel.create({ team_id: team._id.toString(), user_id: userId, role: 'creator' });
  return toTeam(team, { role: 'creator', member_count: 1, task_count: 0 });
};

export const getTeamsForUser = async (userId: string) => {
  const memberships = await TeamMemberModel.find({ user_id: userId }).sort({ joined_at: -1 }).exec();
  const teams = await TeamModel.find({ _id: { $in: memberships.map((membership) => membership.team_id) } })
    .sort({ created_at: -1 })
    .exec();

  return Promise.all(
    teams.map(async (team) => {
      const teamId = team._id.toString();
      const membership = memberships.find((item) => item.team_id === teamId);
      const memberCount = await TeamMemberModel.countDocuments({ team_id: teamId });
      const taskCount = await model('Task').countDocuments({ team_id: teamId });
      return toTeam(team, {
        role: membership?.role,
        member_count: memberCount,
        task_count: taskCount,
      });
    }),
  );
};

export const getTeamForUser = async (teamId: string, userId: string) => {
  const [team, membership] = await Promise.all([
    TeamModel.findById(teamId).exec(),
    TeamMemberModel.findOne({ team_id: teamId, user_id: userId }).exec(),
  ]);

  return team && membership ? toTeam(team, { role: membership.role }) : null;
};

export const getTeamById = async (teamId: string) => {
  const team = await TeamModel.findById(teamId).exec();
  return team ? toTeam(team) : null;
};

export const updateTeamName = async (teamId: string, name: string) => {
  const team = await TeamModel.findByIdAndUpdate(teamId, { name }, { new: true }).exec();
  return team ? toTeam(team) : null;
};

export const deleteTeamById = async (teamId: string) => {
  await Promise.all([
    TeamModel.findByIdAndDelete(teamId).exec(),
    TeamMemberModel.deleteMany({ team_id: teamId }).exec(),
    model('Task').deleteMany({ team_id: teamId }).exec(),
  ]);
};

export const getTeamMembers = async (teamId: string) => {
  const members = await TeamMemberModel.find({ team_id: teamId }).sort({ role: 1, joined_at: 1 }).exec();
  const users = await findUsersByIds(members.map((member) => member.user_id));

  return members.map((member) => {
    const user = users.find((item) => item.id === member.user_id);
    return toTeamMember(member, {
      name: user?.name ?? 'Unknown user',
      email: user?.email ?? '',
    });
  });
};

export const getMembership = async (teamId: string, userId: string) => {
  const membership = await TeamMemberModel.findOne({ team_id: teamId, user_id: userId }).exec();
  return membership ? toTeamMember(membership) : null;
};

export const addTeamMember = async (teamId: string, userId: string, role: TeamRole = 'member') => {
  const membership = await TeamMemberModel.findOneAndUpdate(
    { team_id: teamId, user_id: userId },
    { team_id: teamId, user_id: userId, role },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();

  return toTeamMember(membership);
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  await TeamMemberModel.deleteOne({ team_id: teamId, user_id: userId }).exec();
};

export { TeamModel, TeamMemberModel };
