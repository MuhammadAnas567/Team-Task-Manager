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

const statusOptions: TaskStatus[] = ['pending', 'in_progress', 'completed'];

type Props = {
  task: Task;
  canDelete: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  index?: number;
};

const isOverdue = (task: Task) => {
  if (!task.due_date || task.status === 'completed') return false;
  return new Date(task.due_date) < new Date();
};

export function TaskCard({ task, canDelete, onEdit, onDelete, onStatusChange, index = 0 }: Props) {
  const overdue = isOverdue(task);

  return (
    <article
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group animate-fade-up relative overflow-hidden rounded-[1.25rem] border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        overdue ? 'border-rose-200 hover:border-rose-300' : 'border-[var(--color-border)] hover:border-violet-200'
      }`}
    >
      {overdue && (
        <div className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white">
          Overdue
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0">
          <p className="text-[0.9375rem] font-bold leading-snug text-[var(--color-text)]">{task.title}</p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
            {task.description || 'No description'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase ring-1 ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-2.5 rounded-xl bg-[var(--color-surface-muted)] p-3.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[var(--color-text-muted)]">Status</span>
          {onStatusChange ? (
            <select
              value={task.status}
              onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--color-text)] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-bold text-[var(--color-text)]">{statusLabels[task.status]}</span>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <span className="font-semibold text-[var(--color-text-muted)]">Assignee</span>
          <span className="truncate font-bold text-[var(--color-text)]">{task.assignee_name ?? 'Unassigned'}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="font-semibold text-[var(--color-text-muted)]">Due</span>
          <span className={`font-bold ${overdue ? 'text-rose-600' : 'text-[var(--color-text)]'}`}>
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex-1 rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
        >
          Edit
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="flex-1 rounded-xl bg-rose-50 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
