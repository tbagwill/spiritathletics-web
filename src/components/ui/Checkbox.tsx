'use client';

import { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from './cn';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
};

/** Native checkbox (keyboard + screen reader friendly) drawn as a rounded brand box, with a tappable label. */
export function Checkbox({ checked, onCheckedChange, children, disabled, invalid, className }: CheckboxProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={cn(
            'peer size-5 cursor-pointer appearance-none rounded-md bg-white ring-1 ring-inset ring-slate-300 transition-colors',
            'checked:bg-spirit checked:ring-spirit hover:ring-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirit-400 focus-visible:ring-offset-2',
            invalid && 'ring-red-400',
          )}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}
