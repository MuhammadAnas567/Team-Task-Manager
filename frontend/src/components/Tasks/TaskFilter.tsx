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
  searching?: boolean;
};

export function TaskFilter({ filters, members, onChange, searching }: Props) {
  return (
    <div className="glass-card animate-fade-up rounded-[1.75rem] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="kicker">Filters</p>
          <h3 className="heading-section mt-0.5 text-lg">Search & refine</h3>
        </div>
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', priority: '', assigned_to: '' })}
          className="btn-secondary !rounded-full !px-4 !py-2"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label className="relative">
          <span className="form-label !mb-1.5 !text-[0.6875rem] !uppercase !tracking-wider">Search</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Title or description…"
            className="filter-input !mt-0 pr-10"
          />
          {searching && (
            <span className="absolute bottom-3 right-3 h-4 w-4 animate-spin-slow rounded-full border-2 border-violet-200 border-t-violet-600" />
          )}
        </label>

        <label>
          <span className="form-label !mb-1.5 !text-[0.6875rem] !uppercase !tracking-wider">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters['status'] })}
            className="filter-input !mt-0"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          <span className="form-label !mb-1.5 !text-[0.6875rem] !uppercase !tracking-wider">Priority</span>
          <select
            value={filters.priority}
            onChange={(event) => onChange({ ...filters, priority: event.target.value as TaskFilters['priority'] })}
            className="filter-input !mt-0"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          <span className="form-label !mb-1.5 !text-[0.6875rem] !uppercase !tracking-wider">Assignee</span>
          <select
            value={filters.assigned_to}
            onChange={(event) => onChange({ ...filters, assigned_to: event.target.value || '' })}
            className="filter-input !mt-0"
          >
            <option value="">All members</option>
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
