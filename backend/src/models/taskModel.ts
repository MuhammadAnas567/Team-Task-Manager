// backend/src/models/taskModel.ts

import { Schema, Types, model } from 'mongoose';
import type { Task, TaskPriority, TaskStatus } from '../types';
import { findUsersByIds } from './userModel';
import { getMembership, TeamModel, TeamMemberModel } from './teamModel';

export type TaskFilters = {
  team_id?: string;
  assigned_to?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  team_id: string;
  assigned_to?: string | null;
  created_by: string;
  due_date?: string | null;
};

export type TaskUpdateInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
};

type TaskDocument = {
  _id: { toString: () => string };
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  team_id: string;
  assigned_to: string | null;
  created_by: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
};

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, default: null },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    team_id: { type: String, required: true, index: true },
    assigned_to: { type: String, default: null, index: true },
    created_by: { type: String, required: true, index: true },
    due_date: { type: Date, default: null, index: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

taskSchema.pre('save', function updateTimestamp() {
  this.updated_at = new Date();
});

taskSchema.pre('findOneAndUpdate', function updateTimestamp() {
  this.set({ updated_at: new Date() });
});

const TaskModel = model<TaskDocument>('Task', taskSchema);

const enrichTasks = async (documents: TaskDocument[]) => {
  const teamIds = [
    ...new Set(
      documents
        .map((task) => task.team_id)
        .filter((teamId) => Types.ObjectId.isValid(teamId)),
    ),
  ];
  const assigneeIds = [
    ...new Set(documents.map((task) => task.assigned_to).filter((id): id is string => Boolean(id))),
  ];
  const [teams, assignees] = await Promise.all([
    TeamModel.find({ _id: { $in: teamIds } }).exec(),
    findUsersByIds(assigneeIds),
  ]);

  return documents.map((task): Task => {
    const team = teams.find((item) => item._id.toString() === task.team_id);
    const assignee = assignees.find((item) => item.id === task.assigned_to);

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      team_id: task.team_id,
      assigned_to: task.assigned_to,
      created_by: task.created_by,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      team_name: team?.name,
      assignee_name: assignee?.name ?? null,
      assignee_email: assignee?.email ?? null,
    };
  });
};

export const getTasksForUser = async (userId: string, filters: TaskFilters) => {
  const memberships = await TeamMemberModel.find({ user_id: userId }).exec();
  const allowedTeamIds = memberships.map((membership) => membership.team_id);

  if (!allowedTeamIds.length) {
    return [];
  }

  const conditions: Record<string, unknown> = {
    team_id: { $in: allowedTeamIds },
  };

  if (filters.team_id) {
    if (!allowedTeamIds.includes(filters.team_id)) {
      return [];
    }

    conditions.team_id = filters.team_id;
  }
  if (filters.assigned_to) conditions.assigned_to = filters.assigned_to;
  if (filters.status) conditions.status = filters.status;
  if (filters.priority) conditions.priority = filters.priority;
  if (filters.search) {
    conditions.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const tasks = await TaskModel.find(conditions).sort({ due_date: 1, updated_at: -1 }).exec();
  return enrichTasks(tasks);
};

export const getTaskForUser = async (taskId: string, userId: string) => {
  const task = await TaskModel.findById(taskId).exec();

  if (!task) {
    return null;
  }

  const membership = await getMembership(task.team_id, userId);
  if (!membership) {
    return null;
  }

  const [enrichedTask] = await enrichTasks([task]);
  return enrichedTask;
};

export const createTask = async (input: TaskCreateInput) => {
  const task = await TaskModel.create({
    title: input.title,
    description: input.description || null,
    status: input.status ?? 'pending',
    priority: input.priority ?? 'medium',
    team_id: input.team_id,
    assigned_to: input.assigned_to ?? null,
    created_by: input.created_by,
    due_date: input.due_date ? new Date(input.due_date) : null,
  });

  const [enrichedTask] = await enrichTasks([task]);
  return enrichedTask;
};

export const updateTask = async (taskId: string, input: TaskUpdateInput) => {
  const updates: Partial<TaskDocument> = {};

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to;
  if (input.due_date !== undefined) updates.due_date = input.due_date ? new Date(input.due_date) : null;

  const task = await TaskModel.findByIdAndUpdate(taskId, updates, { new: true }).exec();

  if (!task) {
    return null;
  }

  const [enrichedTask] = await enrichTasks([task]);
  return enrichedTask;
};

export const deleteTaskById = async (taskId: string) => {
  await TaskModel.findByIdAndDelete(taskId).exec();
};

export const getDueSoonTasks = async (userId: string) => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await TaskModel.find({
    assigned_to: userId,
    status: { $ne: 'completed' },
    due_date: { $gte: now, $lte: next24Hours },
  })
    .sort({ due_date: 1 })
    .exec();

  return enrichTasks(tasks);
};

export { TaskModel };
