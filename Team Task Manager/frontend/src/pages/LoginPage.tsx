// frontend/src/pages/LoginPage.tsx

import { Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import type { User } from '../types';

type Props = {
  user: User | null;
  onAuthenticated: (user: User) => void;
};

export function LoginPage({ user, onAuthenticated }: Props) {
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden p-12 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#6366f1,transparent_30%),radial-gradient(circle_at_70%_70%,#06b6d4,transparent_25%)] opacity-70" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-black uppercase tracking-[0.25em] text-indigo-100 backdrop-blur w-fit">
            Advanced assessment build
          </div>
          <div className="max-w-xl">
            <h1 className="text-6xl font-black tracking-tight">Manage team delivery with clarity.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-200">
              Secure sessions, role-based teams, searchable task boards, reminders, and production-ready MongoDB APIs.
            </p>
          </div>
        </div>
      </section>

      <section className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-slate-950 shadow-2xl shadow-indigo-950/30">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Login to dashboard</h2>
          <p className="mb-7 mt-2 text-sm text-slate-500">Use your secure session to access protected teams and tasks.</p>
          <LoginForm
            onSuccess={(nextUser) => {
              onAuthenticated(nextUser);
              navigate('/dashboard');
            }}
          />
        </div>
      </section>
    </main>
  );
}
