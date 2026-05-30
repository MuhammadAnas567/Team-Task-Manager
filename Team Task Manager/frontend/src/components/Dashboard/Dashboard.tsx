// frontend/src/components/Dashboard/Dashboard.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, getErrorMessage, taskApi, teamApi } from '../../api';
import type { Task, Team, TeamMember, User } from '../../types';
import { useToast } from '../useToast';
import { TaskModal, type TaskFormValues } from '../Tasks/TaskModal';
import { TaskFilter, type TaskFilters } from '../Tasks/TaskFilter';
import { AddMemberModal } from '../Teams/AddMemberModal';
import { CreateTeamModal } from '../Teams/CreateTeamModal';
import { TaskList } from './TaskList';
import { TeamList } from './TeamList';

type Props = {
  user: User;
  onLogout: () => void;
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
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams],
  );

  const isCreator = selectedTeam?.role === 'creator';
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const progressPercent = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length;

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const { data } = await teamApi.list();
      setTeams(data.teams);
      setSelectedTeamId((current) => current ?? data.teams[0]?.id);
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

      try {
        const { data } = await teamApi.get(teamId);
        setMembers(data.members);
      } catch (error) {
        notify('error', getErrorMessage(error));
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
        search: filters.search.trim() || undefined,
      });
      setTasks(data.tasks);
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setLoadingTasks(false);
    }
  }, [filters, notify, selectedTeamId]);

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

  const createTeam = async (values: { name: string }) => {
    try {
      const { data } = await teamApi.create({ name: values.name.trim() });
      setTeams((current) => [data.team, ...current]);
      setSelectedTeamId(data.team.id);
      notify('success', 'Team created');
    } catch (error) {
      notify('error', getErrorMessage(error));
    }
  };

  const deleteSelectedTeam = async () => {
    if (!selectedTeam || !window.confirm(`Delete team "${selectedTeam.name}"?`)) return;

    try {
      await teamApi.remove(selectedTeam.id);
      notify('success', 'Team deleted');
      await loadTeams();
    } catch (error) {
      notify('error', getErrorMessage(error));
    }
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
  };

  const deleteTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      await taskApi.remove(task.id);
      notify('success', 'Task deleted');
      await loadTasks();
      await loadDueSoon();
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
      }
    } catch (error) {
      notify('error', getErrorMessage(error));
      throw error;
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => undefined);
    onLogout();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_28%),radial-gradient(circle_at_top_right,#f0abfc,transparent_24%),linear-gradient(135deg,#f8fafc,#eef2ff_50%,#f8fafc)]">
      <div className="pointer-events-none absolute left-12 top-28 h-72 w-72 animate-float rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-64 h-80 w-80 animate-float rounded-full bg-cyan-300/25 blur-3xl" />
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Team Task Manager</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Good work starts here, {user.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {isCreator && (
              <>
                <button
                  onClick={() => setMemberModalOpen(true)}
                  className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                >
                  Add member
                </button>
                <button
                  onClick={deleteSelectedTeam}
                  className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-700 shadow-sm transition hover:bg-rose-50"
                >
                  Delete team
                </button>
              </>
            )}
            <button
              onClick={logout}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr]">
        <TeamList
          teams={teams}
          selectedTeamId={selectedTeamId}
          loading={loadingTeams}
          onSelect={setSelectedTeamId}
          onCreateClick={() => setTeamModalOpen(true)}
        />

        <section className="space-y-5">
          {dueSoonTasks.length > 0 && (
            <div className="animate-fade-up rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-lg shadow-amber-100">
              <p className="font-black">Reminder: {dueSoonTasks.length} assigned task(s) are due within 24 hours.</p>
            </div>
          )}

          <div className="animate-fade-up relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-indigo-200">
            <div className="absolute -right-16 -top-16 h-56 w-56 animate-pulse-glow rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-indigo-200">Selected team</p>
                <h2 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                  {selectedTeam?.name ?? 'No team selected'}
                </h2>
                <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-300">
                  Track ownership, sprint flow, priorities, and delivery health from one professional workspace.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Members', members.length],
                    ['Visible tasks', tasks.length],
                    ['High priority', highPriorityTasks],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <p className="text-2xl font-black">{value}</p>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-xs rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-white">Completion</p>
                  <p className="text-sm font-black text-indigo-200">{progressPercent}%</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-400 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                  disabled={!selectedTeamId}
                  className="mt-5 w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + New task
                </button>
              </div>
            </div>
          </div>

          <TaskFilter filters={filters} members={members} onChange={setFilters} />
          {loadingTasks && <p className="text-sm font-semibold text-slate-500">Loading tasks...</p>}
          <TaskList
            tasks={tasks}
            user={user}
            loading={loadingTasks}
            onEdit={(task) => {
              setEditingTask(task);
              setTaskModalOpen(true);
            }}
            onDelete={deleteTask}
          />
        </section>
      </div>

      <button
        onClick={() => {
          setEditingTask(null);
          setTaskModalOpen(true);
        }}
        disabled={!selectedTeamId}
        className="fixed bottom-6 right-6 z-40 grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600 text-3xl font-black text-white shadow-2xl shadow-indigo-300 transition hover:-translate-y-1 hover:bg-indigo-500 disabled:opacity-50"
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
    </main>
  );
}
