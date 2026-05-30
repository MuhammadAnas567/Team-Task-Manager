// frontend/src/App.tsx

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authApi } from './api';
import { ToastProvider } from './components/ToastProvider';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-6 text-center shadow-2xl shadow-indigo-950">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-200">
            Checking secure session
          </p>
          <p className="mt-2 text-slate-300">Loading your workspace...</p>
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
