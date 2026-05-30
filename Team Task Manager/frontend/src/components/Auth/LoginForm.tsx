// frontend/src/components/Auth/LoginForm.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { authApi, getErrorMessage } from '../../api';
import type { User } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
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
      <div>
        <label className="text-sm font-bold text-slate-700">Email address</label>
        <input
          {...register('email')}
          type="email"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="you@company.com"
        />
        {errors.email && <p className="mt-2 text-sm font-medium text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">Password</label>
        <input
          {...register('password')}
          type="password"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="Minimum 8 characters"
        />
        {errors.password && <p className="mt-2 text-sm font-medium text-red-600">{errors.password.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      )}

      <button
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-black text-indigo-600 hover:text-indigo-500">
          Create an account
        </Link>
      </p>
    </form>
  );
}
