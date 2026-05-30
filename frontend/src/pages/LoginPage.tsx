// frontend/src/pages/LoginPage.tsx

import { Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Auth/AuthLayout';
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
    <AuthLayout variant="login">
      <LoginForm
        onSuccess={(nextUser) => {
          onAuthenticated(nextUser);
          navigate('/dashboard');
        }}
      />
    </AuthLayout>
  );
}
