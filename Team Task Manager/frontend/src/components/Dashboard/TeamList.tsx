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
    <aside className="glass-card animate-fade-up h-full rounded-[2rem] p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Workspace</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Teams</h2>
        </div>
        <button
          onClick={onCreateClick}
          className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-indigo-600"
        >
          + Create
        </button>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        )}
        {!loading && teams.length === 0 && (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/60 p-5 text-sm font-semibold text-slate-600">
            No teams yet. Create one to start assigning professional work.
          </div>
        )}

        {teams.map((team, index) => (
          <button
            key={team.id}
            onClick={() => onSelect(team.id)}
            style={{ animationDelay: `${index * 70}ms` }}
            className={`group animate-fade-up w-full overflow-hidden rounded-3xl border p-4 text-left transition hover:-translate-y-1 ${
              selectedTeamId === team.id
                ? 'border-indigo-300 bg-gradient-to-br from-indigo-600 to-slate-950 text-white shadow-2xl shadow-indigo-200'
                : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-xl hover:shadow-indigo-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-base font-black ${selectedTeamId === team.id ? 'text-white' : 'text-slate-950'}`}>
                  {team.name}
                </p>
                <p className={`mt-1 text-xs font-semibold ${selectedTeamId === team.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {team.member_count ?? 0} members · {team.task_count ?? 0} tasks
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                  selectedTeamId === team.id
                    ? 'bg-white/15 text-white ring-1 ring-white/20'
                    : team.role === 'creator'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {team.role}
              </span>
            </div>
            <div className={`mt-4 h-1.5 overflow-hidden rounded-full ${selectedTeamId === team.id ? 'bg-white/15' : 'bg-slate-100'}`}>
              <div
                className={`h-full rounded-full ${selectedTeamId === team.id ? 'bg-white' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(((team.task_count ?? 0) + 1) * 18, 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
