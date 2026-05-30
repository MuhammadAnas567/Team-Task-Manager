import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  variant: 'login' | 'register';
  children: ReactNode;
};

const content = {
  login: {
    kicker: 'Welcome back',
    title: 'Sign in to your workspace',
    subtitle: 'Access your teams, tasks, and assignments with a secure session.',
    heroTitle: 'Ship work faster with your team.',
    heroText:
      'Organize sprints, assign ownership, track priorities, and stay ahead of deadlines — all in one place.',
    features: ['Secure sessions', 'Role-based teams', 'Smart filters', 'Due reminders'],
    altLink: { to: '/register', label: "Don't have an account?", action: 'Create one free' },
  },
  register: {
    kicker: 'Get started',
    title: 'Create your account',
    subtitle: 'Join in seconds. Your password is encrypted with bcrypt before storage.',
    heroTitle: 'Built for teams that deliver.',
    heroText:
      'Create workspaces, invite members, assign tasks, and monitor progress with a clean professional dashboard.',
    features: ['Free to start', 'Team collaboration', 'Task boards', 'Real-time filters'],
    altLink: { to: '/login', label: 'Already have an account?', action: 'Sign in' },
  },
};

export function AuthLayout({ variant, children }: Props) {
  const c = content[variant];
  const formFirst = variant === 'register';

  const formSection = (
    <section className="relative z-10 flex min-h-[50vh] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:py-14">
      <div className="auth-card animate-fade-up w-full max-w-[420px] rounded-[1.75rem] p-8 sm:p-9">
        <div className="mb-8 lg:hidden">
          <p className="kicker">Team Task Manager</p>
        </div>
        <p className="kicker">{c.kicker}</p>
        <h1 className="heading-section mt-2">{c.title}</h1>
        <p className="text-body mt-2.5">{c.subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="text-caption mt-7 text-center">
          {c.altLink.label}{' '}
          <Link to={c.altLink.to} className="link-primary">
            {c.altLink.action}
          </Link>
        </p>
      </div>
    </section>
  );

  const heroSection = (
    <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div className="pointer-events-none absolute inset-0 auth-mesh opacity-90" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 animate-float rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-64 w-64 animate-float rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-violet-500/30">
          T
        </div>
        <div>
          <p className="text-sm font-bold text-white">Team Task Manager</p>
          <p className="text-xs font-medium text-slate-400">Professional workspace</p>
        </div>
      </div>

      <div className="relative z-10 max-w-lg">
        <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
          {c.heroTitle}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300">{c.heroText}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3">
          {c.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs font-medium text-slate-500">
        Secure · Session-based · Production ready
      </p>
    </section>
  );

  return (
    <main className="auth-page grid min-h-screen lg:grid-cols-2">
      {formFirst ? (
        <>
          {formSection}
          {heroSection}
        </>
      ) : (
        <>
          {heroSection}
          {formSection}
        </>
      )}
    </main>
  );
}
