import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon: ReactNode;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, error, icon, id, type, placeholder, autoComplete, className, ...inputProps },
  ref,
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={fieldId} className="form-label">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          ref={ref}
          id={fieldId}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`form-input ${className ?? ''}`.trim()}
          {...inputProps}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

export function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M5.5 8l6.2 4.65a1 1 0 001.2 0L19.5 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8.5a4 4 0 118 0V11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6 19.5c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
