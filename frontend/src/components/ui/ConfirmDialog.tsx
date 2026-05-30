type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200'
      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="animate-pop w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-indigo-950/30">
        <div className="p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Confirm action</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-2xl px-5 py-3 font-black text-white shadow-lg transition disabled:opacity-60 ${confirmClasses}`}
            >
              {loading ? 'Working...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
