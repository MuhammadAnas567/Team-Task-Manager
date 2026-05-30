// frontend/src/pages/RegisterPage.tsx

import { Navigate, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/Auth/RegisterForm';
import type { User } from '../types';

type Props = {
  user: User | null;
  onAuthenticated: (user: User) => void;
};

export function RegisterPage({ user, onAuthenticated }: Props) {
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-slate-950 shadow-2xl shadow-indigo-950/30">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Start free</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Create your account</h2>
          <p className="mb-7 mt-2 text-sm text-slate-500">Register securely with bcrypt-backed password storage.</p>
          <RegisterForm
            onSuccess={(nextUser) => {
              onAuthenticated(nextUser);
              navigate('/dashboard');
            }}
          />
        </div>
      </section>

      <section className="relative hidden overflow-hidden p-12 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#22c55e,transparent_28%),radial-gradient(circle_at_70%_65%,#6366f1,transparent_28%)] opacity-70" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-black uppercase tracking-[0.25em] text-indigo-100 backdrop-blur w-fit">
            Production style app
          </div>
          <div className="max-w-xl">
            <h1 className="text-6xl font-black tracking-tight">Teams, tasks, and ownership in one place.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-200">
              Create teams, add members, assign work, filter tasks, and stay ahead of due dates.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
