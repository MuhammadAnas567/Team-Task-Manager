// frontend/src/components/Dashboard/TaskList.tsx

import type { Task, TaskStatus, User } from '../../types';
import { TaskCard } from '../Tasks/TaskCard';

const columns: { key: TaskStatus; label: string; dot: string }[] = [
  { key: 'pending', label: 'Pending', dot: 'bg-slate-400' },
  { key: 'in_progress', label: 'In progress', dot: 'bg-violet-500' },
  { key: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
];

type Props = {
  tasks: Task[];
  user: User;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

export function TaskList({ tasks, user, loading, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <section key={column.key} className="glass-card animate-fade-up min-h-72 rounded-[1.75rem] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                <h3 className="text-sm font-bold text-[var(--color-text)]">{column.label}</h3>
              </div>
              <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-text-muted)]">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canDelete={task.created_by === user.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  index={index}
                />
              ))}

              {!loading && columnTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-6 text-center">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">No tasks here yet</p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
