// frontend/src/components/Auth/RegisterForm.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi, getErrorMessage } from '../../api';
import type { User } from '../../types';
import { AuthInput, EmailIcon, LockIcon, UserIcon } from './AuthInput';

const registerSchema = z.object({
  name: z.string().min(2, 'Username must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerError('');
    try {
      const { data } = await authApi.register(values);
      onSuccess(data.user);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        label="Username"
        autoComplete="username"
        placeholder="alex_morgan"
        icon={<UserIcon />}
        error={errors.name?.message}
        {...register('name')}
      />

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
        autoComplete="new-password"
        placeholder="Minimum 8 characters"
        icon={<LockIcon />}
        error={errors.password?.message}
        {...register('password')}
      />

      {serverError && <div className="form-alert-error">{serverError}</div>}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Creating account…' : 'Create free account'}
      </button>
    </form>
  );
}
