// frontend/src/api/index.ts

import axios from 'axios';
import type {
  AuthResponse,
  TaskResponse,
  TasksResponse,
  TeamDetailResponse,
  TeamResponse,
  TeamsResponse,
} from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return 'Something went wrong';
};

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload),
  logout: () => api.post<{ success: boolean; message: string }>('/auth/logout'),
  me: () => api.get<AuthResponse>('/auth/me'),
};

export const teamApi = {
  list: () => api.get<TeamsResponse>('/teams'),
  create: (payload: { name: string }) => api.post<TeamResponse>('/teams', payload),
  get: (teamId: string) => api.get<TeamDetailResponse>(`/teams/${teamId}`),
  update: (teamId: string, payload: { name: string }) => api.put<TeamResponse>(`/teams/${teamId}`, payload),
  remove: (teamId: string) => api.delete(`/teams/${teamId}`),
  addMember: (teamId: string, payload: { email: string }) =>
    api.post(`/teams/${teamId}/members`, payload),
  removeMember: (teamId: string, userId: string) => api.delete(`/teams/${teamId}/members/${userId}`),
  invite: (teamId: string, payload: { email: string }) =>
    api.post<{ success: boolean; message: string }>(`/teams/${teamId}/invite`, payload),
};

export const taskApi = {
  list: (params: {
    team_id?: string;
    assigned_to?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) => api.get<TasksResponse>('/tasks', { params }),
  dueSoon: () => api.get<TasksResponse>('/tasks/reminders/due-soon'),
  create: (payload: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    team_id: string;
    assigned_to?: string | null;
    due_date?: string | null;
  }) => api.post<TaskResponse>('/tasks', payload),
  get: (taskId: string) => api.get<TaskResponse>(`/tasks/${taskId}`),
  update: (
    taskId: string,
    payload: {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      assigned_to?: string | null;
      due_date?: string | null;
    },
  ) => api.put<TaskResponse>(`/tasks/${taskId}`, payload),
  remove: (taskId: string) => api.delete(`/tasks/${taskId}`),
};
