// frontend/src/components/Teams/AddMemberModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getErrorMessage } from '../../api';

const memberSchema = z.object({
  email: z.string().email('Enter a valid email'),
  inviteOnly: z.boolean(),
});

type MemberValues = z.infer<typeof memberSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MemberValues) => Promise<void>;
};

export function AddMemberModal({ open, onClose, onSubmit }: Props) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: '', inviteOnly: false },
  });

  const inviteOnly = watch('inviteOnly');

  if (!open) {
    return null;
  }

  const submit = async (values: MemberValues) => {
    setServerError('');
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    setServerError('');
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit(submit)}
        className="animate-pop w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-2xl"
      >
        <div className="relative bg-slate-950 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="kicker text-violet-300">Team member</p>
              <h2 className="mt-1 text-2xl font-extrabold">Add or invite</h2>
            </div>
            <button type="button" onClick={handleClose} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/20">
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-xs leading-relaxed text-violet-900">
            {inviteOnly
              ? 'Invite stub: no real email is sent. The person still needs to register before they can join tasks.'
              : 'Direct add: the email must already belong to a registered user in this app.'}
          </p>

          <label>
            <span className="form-label">Member email</span>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="member@company.com"
              className="filter-input !mt-0 !pl-4"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <input type="checkbox" {...register('inviteOnly')} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-bold text-[var(--color-text)]">Send invite stub only</span>
              <span className="mt-0.5 block text-xs">Use when they have not registered yet (no real email sent).</span>
            </span>
          </label>

          {serverError && <div className="form-alert-error mt-4">{serverError}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-5">
            {isSubmitting ? 'Submitting…' : inviteOnly ? 'Send invite stub' : 'Add member'}
          </button>
        </div>
      </form>
    </div>
  );
}
