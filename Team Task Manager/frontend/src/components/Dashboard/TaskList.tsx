// frontend/src/components/Dashboard/TaskList.tsx

import type { Task, TaskStatus, User } from '../../types';
import { TaskCard } from '../Tasks/TaskCard';

const columns: { key: TaskStatus; label: string; accent: string; glow: string }[] = [
  { key: 'pending', label: 'Pending', accent: 'bg-slate-400', glow: 'from-slate-500/10' },
  { key: 'in_progress', label: 'In progress', accent: 'bg-indigo-500', glow: 'from-indigo-500/15' },
  { key: 'completed', label: 'Completed', accent: 'bg-emerald-500', glow: 'from-emerald-500/15' },
];

type Props = {
  tasks: Task[];
  user: User;
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskList({ tasks, user, loading, onEdit, onDelete }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <section
            key={column.key}
            className={`glass-card animate-fade-up min-h-80 rounded-[2rem] bg-gradient-to-b ${column.glow} to-white/70 p-4`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${column.accent} animate-pulse-glow shadow-lg`} />
                <h3 className="text-lg font-black text-slate-950">{column.label}</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canDelete={task.created_by === user.id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  index={index}
                />
              ))}

              {!loading && columnTasks.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm font-semibold text-slate-400">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl">•</div>
                  No tasks in this lane yet.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
