// frontend/src/components/Tasks/TaskCard.tsx

import type { Task, TaskPriority, TaskStatus } from '../../types';

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  medium: 'bg-amber-50 text-amber-700 ring-amber-100',
  high: 'bg-rose-50 text-rose-700 ring-rose-100',
};

type Props = {
  task: Task;
  canDelete: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  index?: number;
};

export function TaskCard({ task, canDelete, onEdit, onDelete, index = 0 }: Props) {
  return (
    <article
      style={{ animationDelay: `${index * 80}ms` }}
      className="group animate-fade-up relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/80"
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-100 opacity-0 blur-2xl transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <p className="text-lg font-black leading-tight text-slate-950">{task.title}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {task.description || 'No description provided.'}
          </p>
        </div>
        <span className={`relative rounded-full px-3 py-1 text-xs font-black ring-1 ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="relative mt-5 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
        <div className="flex justify-between gap-3">
          <span className="font-bold text-slate-400">Status</span>
          <span className="font-black text-slate-800">{statusLabels[task.status]}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-bold text-slate-400">Assignee</span>
          <span className="font-black text-slate-800">{task.assignee_name ?? 'Unassigned'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-bold text-slate-400">Due</span>
          <span className="font-black text-slate-800">
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 rounded-2xl bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-100"
        >
          Edit
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(task)}
            className="flex-1 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
