import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from './cn';

type Variant = 'primary' | 'dark' | 'light' | 'white' | 'glass' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-spirit text-white shadow-[0_8px_24px_-8px_rgba(0,0,254,0.6)] hover:bg-spirit-500 active:bg-spirit',
  dark: 'bg-ink text-white hover:bg-ink-700',
  light: 'bg-white text-ink shadow-soft hover:bg-slate-50',
  white: 'bg-white text-spirit shadow-soft hover:bg-spirit-50',
  glass: 'bg-white/10 text-white ring-1 ring-inset ring-white/15 backdrop-blur hover:bg-white/15',
  outline: 'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirit-400 focus-visible:ring-offset-2',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, className })}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});
