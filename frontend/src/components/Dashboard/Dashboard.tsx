// frontend/src/components/Dashboard/Dashboard.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, getErrorMessage, taskApi, teamApi } from '../../api';
import { useDebounce } from '../../hooks/useDebounce';
import type { Task, TaskStatus, Team, TeamMember, User } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../useToast';
import { DueSoonBanner } from './DueSoonBanner';
import { TaskModal, type TaskFormValues } from '../Tasks/TaskModal';
import { TaskFilter, type TaskFilters } from '../Tasks/TaskFilter';
import { AddMemberModal } from '../Teams/AddMemberModal';
import { CreateTeamModal } from '../Teams/CreateTeamModal';
import { EditTeamModal } from '../Teams/EditTeamModal';
import { TeamMembersPanel } from '../Teams/TeamMembersPanel';
import { TaskList } from './TaskList';
import { TeamList } from './TeamList';

type Props = {
  user: User;
  onLogout: () => void;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'default';
  onConfirm: () => Promise<void>;
};

const emptyFilters: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  assigned_to: '',
};

export function Dashboard({ user, onLogout }: Props) {
  const { notify } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dueSoonTasks, setDueSoonTasks] = useState<Task[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const debouncedSearch = useDebounce(filters.search, 400);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams],
  );

  const isCreator = selectedTeam?.role === 'creator';
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const progressPercent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const { data } = await teamApi.list();
      setTeams(data.teams);
      setSelectedTeamId((current) => {
        if (current && data.teams.some((team) => team.id === current)) return current;
        return data.teams[0]?.id;
      });
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setLoadingTeams(false);
    }
  }, [notify]);

  const loadTeamDetail = useCallback(
    async (teamId?: string) => {
      if (!teamId) {
        setMembers([]);
        return;
      }

      setLoadingMembers(true);
      try {
        const { data } = await teamApi.get(teamId);
        setMembers(data.members);
      } catch (error) {
        notify('error', getErrorMessage(error));
      } finally {
        setLoadingMembers(false);
      }
    },
    [notify],
  );

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const { data } = await taskApi.list({
        team_id: selectedTeamId,
        assigned_to: filters.assigned_to || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        search: debouncedSearch.trim() || undefined,
      });
      setTasks(data.tasks);
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setLoadingTasks(false);
    }
  }, [debouncedSearch, filters.assigned_to, filters.priority, filters.status, notify, selectedTeamId]);

  const loadDueSoon = useCallback(async () => {
    try {
      const { data } = await taskApi.dueSoon();
      setDueSoonTasks(data.tasks);
    } catch {
      setDueSoonTasks([]);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadDueSoon();
  }, [loadDueSoon, loadTeams]);

  useEffect(() => {
    loadTeamDetail(selectedTeamId);
    setFilters(emptyFilters);
  }, [loadTeamDetail, selectedTeamId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openConfirm = (state: Omit<ConfirmState, 'open'>) => {
    setConfirmState({ ...state, open: true });
  };

  const closeConfirm = () => {
    setConfirmState(null);
    setConfirmLoading(false);
  };

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      closeConfirm();
    } catch (error) {
      notify('error', getErrorMessage(error));
      setConfirmLoading(false);
    }
  };

  const createTeam = async (values: { name: string }) => {
    try {
      const { data } = await teamApi.create({ name: values.name.trim() });
      setTeams((current) => [data.team, ...current]);
      setSelectedTeamId(data.team.id);
      notify('success', 'Team created');
    } catch (error) {
      notify('error', getErrorMessage(error));
      throw error;
    }
  };

  const renameTeam = async (values: { name: string }) => {
    if (!selectedTeamId) return;

    try {
      const { data } = await teamApi.update(selectedTeamId, { name: values.name.trim() });
      setTeams((current) => current.map((team) => (team.id === selectedTeamId ? { ...team, ...data.team } : team)));
      notify('success', 'Team renamed');
    } catch (error) {
      notify('error', getErrorMessage(error));
      throw error;
    }
  };

  const deleteSelectedTeam = () => {
    if (!selectedTeam) return;

    openConfirm({
      title: 'Delete team',
      message: `This will permanently delete "${selectedTeam.name}" and all its tasks. This cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        await teamApi.remove(selectedTeam.id);
        notify('success', 'Team deleted');
        await loadTeams();
      },
    });
  };

  const submitTask = async (values: TaskFormValues) => {
    if (!selectedTeamId) return;

    const payload = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      team_id: selectedTeamId,
      assigned_to: values.assigned_to || null,
      due_date: values.due_date || null,
    };

    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        notify('success', 'Task updated');
      } else {
        await taskApi.create(payload);
        notify('success', 'Task created');
      }

      setTaskModalOpen(false);
      setEditingTask(null);
      await loadTasks();
      await loadDueSoon();
      await loadTeams();
    } catch (error) {
      notify('error', getErrorMessage(error));
      throw error;
    }
  };

  const deleteTask = (task: Task) => {
    openConfirm({
      title: 'Delete task',
      message: `Remove "${task.title}" from the board?`,
      variant: 'danger',
      onConfirm: async () => {
        await taskApi.remove(task.id);
        notify('success', 'Task deleted');
        await loadTasks();
        await loadDueSoon();
        await loadTeams();
      },
    });
  };

  const updateTaskStatus = async (task: Task, status: TaskStatus) => {
    try {
      await taskApi.update(task.id, { status });
      setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status } : item)));
      await loadDueSoon();
      await loadTeams();
    } catch (error) {
      notify('error', getErrorMessage(error));
    }
  };

  const submitMember = async (values: { email: string; inviteOnly: boolean }) => {
    if (!selectedTeamId) return;

    try {
      if (values.inviteOnly) {
        const { data } = await teamApi.invite(selectedTeamId, { email: values.email });
        notify('success', data.message);
      } else {
        await teamApi.addMember(selectedTeamId, { email: values.email });
        notify('success', 'Member added');
        await loadTeamDetail(selectedTeamId);
        await loadTeams();
      }
    } catch (error) {
      notify('error', getErrorMessage(error));
      throw error;
    }
  };

  const removeMember = (member: TeamMember) => {
    if (!selectedTeamId) return;

    openConfirm({
      title: 'Remove member',
      message: `Remove ${member.name} from this team? Their assigned tasks will remain but they lose access.`,
      variant: 'danger',
      onConfirm: async () => {
        await teamApi.removeMember(selectedTeamId, member.user_id);
        notify('success', 'Member removed');
        await loadTeamDetail(selectedTeamId);
        await loadTeams();
      },
    });
  };

  const logout = async () => {
    await authApi.logout().catch(() => undefined);
    onLogout();
  };

  const openTaskFromReminder = (task: Task) => {
    if (task.team_id !== selectedTeamId) {
      setSelectedTeamId(task.team_id);
    }
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  return (
    <main className="dashboard-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-8 top-24 h-80 w-80 animate-float rounded-full bg-violet-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-48 h-72 w-72 animate-float rounded-full bg-cyan-400/12 blur-3xl" />

      <header className="dashboard-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-extrabold text-white shadow-lg shadow-violet-500/25 sm:grid">
              T
            </div>
            <div>
              <p className="kicker">Team Task Manager</p>
              <h1 className="heading-section mt-0.5">
                Hello, <span className="text-[var(--color-primary)]">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-caption mt-0.5 hidden sm:block">Manage teams, tasks, and delivery in one place.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {isCreator && selectedTeamId && (
              <>
                <button type="button" onClick={() => setEditTeamModalOpen(true)} className="btn-secondary">
                  Rename team
                </button>
                <button type="button" onClick={() => setMemberModalOpen(true)} className="btn-secondary">
                  + Add member
                </button>
                <button type="button" onClick={deleteSelectedTeam} className="btn-danger-outline">
                  Delete team
                </button>
              </>
            )}
            <button type="button" onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr]">
        <div className="space-y-5">
          <TeamList
            teams={teams}
            selectedTeamId={selectedTeamId}
            loading={loadingTeams}
            onSelect={setSelectedTeamId}
            onCreateClick={() => setTeamModalOpen(true)}
          />
          {selectedTeamId && (
            <TeamMembersPanel
              members={members}
              currentUserId={user.id}
              isCreator={Boolean(isCreator)}
              loading={loadingMembers}
              onRemove={removeMember}
            />
          )}
        </div>

        <section className="space-y-5">
          <DueSoonBanner tasks={dueSoonTasks} onSelectTask={openTaskFromReminder} />

          <div className="hero-panel animate-fade-up relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 animate-pulse-glow rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <p className="kicker text-violet-300">Selected team</p>
                <h2 className="mt-1 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-white">
                  {selectedTeam?.name ?? 'No team selected'}
                </h2>
                <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-slate-400">
                  Track ownership, sprint flow, priorities, and delivery health from one workspace.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Members', members.length],
                    ['Tasks', tasks.length],
                    ['In progress', inProgressTasks],
                    ['High priority', highPriorityTasks],
                  ].map(([label, value]) => (
                    <div key={label} className="stat-pill">
                      <p className="text-2xl font-extrabold text-white">{value}</p>
                      <p className="mt-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-xs rounded-[1.25rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Completion</p>
                  <p className="text-sm font-extrabold text-violet-300">{progressPercent}%</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                  disabled={!selectedTeamId}
                  className="btn-primary mt-5 !w-full disabled:opacity-50"
                >
                  + New task
                </button>
              </div>
            </div>
          </div>

          <TaskFilter filters={filters} members={members} onChange={setFilters} searching={filters.search !== debouncedSearch} />
          {loadingTasks && (
            <div className="glass-card flex items-center gap-3 rounded-[1.25rem] px-4 py-3.5">
              <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-violet-200 border-t-violet-600" />
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Loading tasks…</p>
            </div>
          )}
          <TaskList
            tasks={tasks}
            user={user}
            loading={loadingTasks}
            onEdit={(task) => {
              setEditingTask(task);
              setTaskModalOpen(true);
            }}
            onDelete={deleteTask}
            onStatusChange={updateTaskStatus}
          />
        </section>
      </div>

      <button
        onClick={() => {
          setEditingTask(null);
          setTaskModalOpen(true);
        }}
        disabled={!selectedTeamId}
        className="btn-accent fixed bottom-6 right-6 z-40 !grid h-14 w-14 !p-0 place-items-center !rounded-2xl text-2xl lg:hidden disabled:opacity-50"
        aria-label="Create task"
      >
        +
      </button>

      <TaskModal
        open={taskModalOpen}
        task={editingTask}
        members={members}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={submitTask}
      />
      <AddMemberModal open={memberModalOpen} onClose={() => setMemberModalOpen(false)} onSubmit={submitMember} />
      <CreateTeamModal open={teamModalOpen} onClose={() => setTeamModalOpen(false)} onSubmit={createTeam} />
      <EditTeamModal
        open={editTeamModalOpen}
        currentName={selectedTeam?.name ?? ''}
        onClose={() => setEditTeamModalOpen(false)}
        onSubmit={renameTeam}
      />
      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          loading={confirmLoading}
          onConfirm={runConfirm}
          onCancel={closeConfirm}
        />
      )}
    </main>
  );
}
