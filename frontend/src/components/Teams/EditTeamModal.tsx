import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
});

type TeamValues = z.infer<typeof teamSchema>;

type Props = {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSubmit: (values: TeamValues) => Promise<void>;
};

export function EditTeamModal({ open, currentName, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: currentName },
  });

  useEffect(() => {
    if (open) reset({ name: currentName });
  }, [open, currentName, reset]);

  if (!open) return null;

  const submit = async (values: TeamValues) => {
    try {
      await onSubmit(values);
      onClose();
    } catch {
      // Error toast is shown by the dashboard handler.
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit(submit)}
        className="animate-pop w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-indigo-950/30"
      >
        <div className="relative bg-slate-950 p-7 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/35 blur-3xl" />
          <p className="relative text-xs font-black uppercase tracking-[0.28em] text-indigo-200">Team settings</p>
          <h2 className="relative mt-2 text-3xl font-black tracking-tight">Rename team</h2>
        </div>

        <div className="p-7">
          <label>
            <span className="text-sm font-black text-slate-700">Team name</span>
            <input
              {...register('name')}
              autoFocus
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold text-slate-950 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
            {errors.name && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.name.message}</p>}
          </label>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
