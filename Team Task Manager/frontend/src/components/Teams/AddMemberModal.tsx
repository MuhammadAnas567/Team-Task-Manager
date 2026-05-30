// frontend/src/components/Teams/AddMemberModal.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: '', inviteOnly: false },
  });

  if (!open) {
    return null;
  }

  const submit = async (values: MemberValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-md">
      <form onSubmit={handleSubmit(submit)} className="animate-pop w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-indigo-950/30">
        <div className="relative bg-slate-950 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-200">Team member</p>
              <h2 className="mt-2 text-2xl font-black">Add or invite</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm font-black transition hover:bg-white/20">
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
        <label>
          <span className="text-sm font-bold text-slate-700">Email</span>
          <input
            {...register('email')}
            type="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            placeholder="member@company.com"
          />
          {errors.email && <p className="mt-2 text-sm font-semibold text-red-600">{errors.email.message}</p>}
        </label>

        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" {...register('inviteOnly')} className="h-4 w-4 rounded border-slate-300" />
          Send invite stub only
        </label>

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        </div>
      </form>
    </div>
  );
}
