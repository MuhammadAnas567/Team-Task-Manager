// frontend/src/pages/DashboardPage.tsx

import { Navigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard/Dashboard';
import type { User } from '../types';

type Props = {
  user: User | null;
  onLogout: () => void;
};

export function DashboardPage({ user, onLogout }: Props) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard user={user} onLogout={onLogout} />;
}
