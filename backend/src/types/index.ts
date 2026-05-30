// backend/src/types/index.ts

import type { Request } from 'express';

export type User = {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
};

export type UserWithPassword = User & {
  password_hash: string;
};

export type TeamRole = 'creator' | 'member';

export type Team = {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
  role?: TeamRole;
  member_count?: number;
  task_count?: number;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: Date;
  name?: string;
  email?: string;
};

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
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
  team_name?: string;
  assignee_name?: string | null;
  assignee_email?: string | null;
};

export type AuthenticatedRequest = Request & {
  user: Express.User;
};

export type ApiMessage = {
  success: boolean;
  message: string;
};

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
    }
  }
}
