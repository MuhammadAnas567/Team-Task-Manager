import { Avatar } from '../ui/Avatar';
import type { TeamMember } from '../../types';

type Props = {
  members: TeamMember[];
  currentUserId: string;
  isCreator: boolean;
  loading?: boolean;
  onRemove: (member: TeamMember) => void;
};

export function TeamMembersPanel({ members, currentUserId, isCreator, loading, onRemove }: Props) {
  return (
    <section className="glass-card animate-fade-up rounded-[1.75rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="kicker">People</p>
          <h3 className="heading-section mt-0.5 text-lg">Members</h3>
        </div>
        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
          {members.length}
        </span>
      </div>

      {loading &&
        [1, 2].map((item) => (
          <div key={item} className="mb-2 h-14 animate-shimmer rounded-xl" />
        ))}

      {!loading && members.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-xs font-semibold text-[var(--color-text-muted)]">
          No members loaded yet.
        </p>
      )}

      <ul className="space-y-2">
        {members.map((member, index) => {
          const isSelf = member.user_id === currentUserId;
          const canRemove = isCreator && member.role !== 'creator';

          return (
            <li
              key={member.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-up flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3 transition hover:border-violet-200 hover:shadow-sm"
            >
              <Avatar name={member.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-[var(--color-text)]">
                    {member.name}
                    {isSelf && <span className="ml-1 text-xs font-semibold text-violet-600">(you)</span>}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase ${
                      member.role === 'creator' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{member.email}</p>
              </div>
              {canRemove && (
                <button type="button" onClick={() => onRemove(member)} className="btn-danger-outline !px-2.5 !py-1.5 !text-xs">
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
