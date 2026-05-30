// frontend/src/pages/RegisterPage.tsx

import { Navigate, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Auth/AuthLayout';
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
    <AuthLayout variant="register">
      <RegisterForm
        onSuccess={(nextUser) => {
          onAuthenticated(nextUser);
          navigate('/dashboard');
        }}
      />
    </AuthLayout>
  );
}
