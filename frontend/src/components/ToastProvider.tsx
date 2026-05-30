// frontend/src/components/ToastProvider.tsx

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ToastMessage, ToastType } from '../types';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-sm space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
                : toast.type === 'error'
                  ? 'border-red-200 bg-red-50/95 text-red-800'
                  : 'border-blue-200 bg-blue-50/95 text-blue-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
