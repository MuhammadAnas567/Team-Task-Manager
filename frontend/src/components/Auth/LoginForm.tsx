// frontend/src/components/Auth/LoginForm.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi, getErrorMessage } from '../../api';
import type { User } from '../../types';
import { AuthInput, EmailIcon, LockIcon } from './AuthInput';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError('');
    try {
      const { data } = await authApi.login(values);
      onSuccess(data.user);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        icon={<EmailIcon />}
        error={errors.email?.message}
        {...register('email')}
      />

      <AuthInput
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        icon={<LockIcon />}
        error={errors.password?.message}
        {...register('password')}
      />

      {serverError && <div className="form-alert-error">{serverError}</div>}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Signing in…' : 'Sign in to dashboard'}
      </button>
    </form>
  );
}
