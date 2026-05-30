// frontend/src/components/Tasks/TaskModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Task, TeamMember } from '../../types';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.string(),
  due_date: z.string(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

type Props = {
  open: boolean;
  task: Task | null;
  members: TeamMember[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

const toInputDate = (date?: string | null) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

export function TaskModal({ open, task, members, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'pending',
      priority: task?.priority ?? 'medium',
      assigned_to: task?.assigned_to ? String(task.assigned_to) : '',
      due_date: toInputDate(task?.due_date),
    });
  }, [open, reset, task]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="animate-pop max-h-[92vh] w-full max-w-2xl overflow-hidden overflow-y-auto rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-indigo-950/30"
      >
        <div className="relative bg-slate-950 p-7 text-white">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-200">
                {task ? 'Edit task' : 'Create task'}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Task details</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/20">
              Cancel
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-7 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Title</span>
            <input
              {...register('title')}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="Prepare sprint plan"
            />
            {errors.title && <p className="mt-2 text-sm font-semibold text-red-600">{errors.title.message}</p>}
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Status</span>
            <select {...register('status')} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Priority</span>
            <select {...register('priority')} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Assign to</span>
            <select {...register('assigned_to')} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-bold text-slate-700">Due date</span>
            <input {...register('due_date')} type="date" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Description</span>
            <textarea
              {...register('description')}
              className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="Add context, acceptance criteria, links..."
            />
          </label>
        </div>

        <button
          disabled={isSubmitting}
          className="mx-7 mb-7 w-[calc(100%-3.5rem)] rounded-2xl bg-indigo-600 px-5 py-3.5 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </div>
  );
}
