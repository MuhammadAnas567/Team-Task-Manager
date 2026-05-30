// frontend/src/types/index.ts

export type User = {
  id: string;
  name: string;
  email: string;
};

export type TeamRole = 'creator' | 'member';

export type Team = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  role?: TeamRole;
  member_count?: number;
  task_count?: number;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  name: string;
  email: string;
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
  due_date: string | null;
  created_at: string;
  updated_at: string;
  team_name?: string;
  assignee_name?: string | null;
  assignee_email?: string | null;
};

export type AuthResponse = {
  user: User;
};

export type TeamResponse = {
  team: Team;
};

export type TeamsResponse = {
  teams: Team[];
};

export type TeamDetailResponse = {
  team: Team;
  members: TeamMember[];
};

export type TasksResponse = {
  tasks: Task[];
};

export type TaskResponse = {
  task: Task;
};

export type ToastType = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};
