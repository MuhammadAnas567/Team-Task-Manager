// frontend/src/components/Dashboard/TeamList.tsx

import type { Team } from '../../types';

type Props = {
  teams: Team[];
  selectedTeamId?: string;
  loading: boolean;
  onSelect: (teamId: string) => void;
  onCreateClick: () => void;
};

export function TeamList({ teams, selectedTeamId, loading, onSelect, onCreateClick }: Props) {
  return (
    <aside className="glass-card animate-fade-up rounded-[1.75rem] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="kicker">Workspace</p>
          <h2 className="heading-section mt-0.5 text-xl">Teams</h2>
        </div>
        <button type="button" onClick={onCreateClick} className="btn-accent shrink-0">
          + New
        </button>
      </div>

      <div className="space-y-2.5">
        {loading &&
          [1, 2, 3].map((item) => (
            <div key={item} className="h-[4.5rem] animate-shimmer rounded-[1.25rem]" />
          ))}

        {!loading && teams.length === 0 && (
          <div className="rounded-[1.25rem] border border-dashed border-violet-200 bg-violet-50/50 p-5">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              No teams yet. Create one to start collaborating.
            </p>
          </div>
        )}

        {teams.map((team, index) => {
          const selected = selectedTeamId === team.id;

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelect(team.id)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`animate-fade-up group w-full overflow-hidden rounded-[1.25rem] border p-4 text-left transition duration-200 ${
                selected
                  ? 'border-violet-300/60 bg-gradient-to-br from-violet-600 to-indigo-800 text-white shadow-lg shadow-violet-500/20'
                  : 'border-[var(--color-border)] bg-white hover:border-violet-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`truncate text-[0.9375rem] font-bold ${selected ? 'text-white' : 'text-[var(--color-text)]'}`}>
                    {team.name}
                  </p>
                  <p className={`mt-0.5 text-xs font-medium ${selected ? 'text-violet-200' : 'text-[var(--color-text-muted)]'}`}>
                    {team.member_count ?? 0} members · {team.task_count ?? 0} tasks
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide ${
                    selected
                      ? 'bg-white/15 text-white ring-1 ring-white/20'
                      : team.role === 'creator'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {team.role}
                </span>
              </div>
              <div className={`mt-3 h-1 overflow-hidden rounded-full ${selected ? 'bg-white/15' : 'bg-slate-100'}`}>
                <div
                  className={`h-full rounded-full transition-all ${selected ? 'bg-white' : 'bg-violet-500'}`}
                  style={{ width: `${Math.min(((team.task_count ?? 0) + 1) * 18, 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
