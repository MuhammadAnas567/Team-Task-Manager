import type { Task } from '../../types';

type Props = {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

const formatDue = (date: string) => {
  const due = new Date(date);
  const now = new Date();
  const diffHours = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (diffHours <= 0) return 'Due now';
  if (diffHours < 24) return `Due in ${diffHours}h`;
  return due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export function DueSoonBanner({ tasks, onSelectTask }: Props) {
  if (tasks.length === 0) return null;

  return (
    <div className="animate-fade-up overflow-hidden rounded-[1.25rem] border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
      <div className="border-b border-amber-200/50 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-base text-white shadow-md">
            ⏰
          </span>
          <div>
            <p className="text-sm font-bold text-amber-950">Due within 24 hours</p>
            <p className="text-xs font-medium text-amber-800/75">
              {tasks.length} task{tasks.length === 1 ? '' : 's'} need attention
            </p>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-amber-200/40">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onSelectTask(task)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-amber-100/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-amber-950">{task.title}</p>
                <p className="truncate text-xs text-amber-800/65">
                  {task.team_name ?? 'Team'} · {task.priority}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[0.6875rem] font-bold text-amber-900 ring-1 ring-amber-200">
                {task.due_date ? formatDue(task.due_date) : '—'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
