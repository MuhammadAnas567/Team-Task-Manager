// frontend/src/components/Tasks/TaskFilter.tsx

import type { TaskPriority, TaskStatus, TeamMember } from '../../types';

export type TaskFilters = {
  search: string;
  status: '' | TaskStatus;
  priority: '' | TaskPriority;
  assigned_to: '' | string;
};

type Props = {
  filters: TaskFilters;
  members: TeamMember[];
  onChange: (filters: TaskFilters) => void;
};

export function TaskFilter({ filters, members, onChange }: Props) {
  return (
    <div className="glass-card animate-fade-up rounded-[2rem] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Command center</p>
          <h3 className="text-lg font-black text-slate-950">Search and filters</h3>
        </div>
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', priority: '', assigned_to: '' })}
          className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-200"
        >
          Reset
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Search</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search task title or description..."
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold outline-none transition focus:-translate-y-0.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </label>

        <label>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters['status'] })}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold outline-none transition focus:-translate-y-0.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Priority</span>
          <select
            value={filters.priority}
            onChange={(event) => onChange({ ...filters, priority: event.target.value as TaskFilters['priority'] })}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold outline-none transition focus:-translate-y-0.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Assignee</span>
          <select
            value={filters.assigned_to}
            onChange={(event) =>
              onChange({
                ...filters,
                assigned_to: event.target.value || '',
              })
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold outline-none transition focus:-translate-y-0.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
