type Props = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const palette = [
  'from-indigo-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
];

const hashName = (name: string) =>
  name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

export function Avatar({ name, size = 'md', className = '' }: Props) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const gradient = palette[hashName(name) % palette.length];

  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-black text-white shadow-lg shadow-slate-200 ${sizeClasses[size]} ${gradient} ${className}`}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}
