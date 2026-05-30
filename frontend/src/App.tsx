// frontend/src/App.tsx

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authApi, isNetworkError } from './api';
import { ToastProvider } from './components/ToastProvider';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch((error) => {
        setBackendOffline(isNetworkError(error));
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return (
      <div className="auth-page auth-mesh grid min-h-screen place-items-center text-white">
        <div className="animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 px-10 py-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-extrabold">
            T
          </div>
          <p className="kicker text-violet-300">Team Task Manager</p>
          <p className="mt-3 text-lg font-bold text-white">Loading your workspace…</p>
          <p className="text-caption mt-1.5 text-slate-400">Verifying secure session</p>
        </div>
      </div>
    );
  }

  if (backendOffline) {
    return (
      <div className="auth-page auth-mesh grid min-h-screen place-items-center px-5 text-white">
        <div className="auth-card max-w-lg rounded-[1.75rem] p-8 text-center">
          <p className="kicker">Connection error</p>
          <h1 className="heading-section mt-2">Backend is not running</h1>
          <p className="text-body mt-3">
            Frontend chal raha hai lekin API (<code className="text-sm">localhost:4000</code>) connect nahi ho
            pa rahi. Vite proxy error <strong>ECONNREFUSED</strong> isi wajah se aa raha hai.
          </p>
          <div className="mt-6 rounded-xl bg-[var(--color-surface-muted)] p-4 text-left text-sm text-[var(--color-text-secondary)]">
            <p className="font-bold text-[var(--color-text)]">Fix — naya terminal kholo:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-200">
              cd &quot;C:\Team Task Manager&quot;{'\n'}npm run dev
            </pre>
            <p className="mt-3 text-xs">
              Ya sirf backend: <code>cd backend &amp;&amp; npm run dev</code>
              <br />
              MongoDB bhi chalna chahiye (<code>mongodb://127.0.0.1:27017</code>).
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-6"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage user={user} onAuthenticated={setUser} />} />
        <Route path="/register" element={<RegisterPage user={user} onAuthenticated={setUser} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} onLogout={() => setUser(null)} />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
