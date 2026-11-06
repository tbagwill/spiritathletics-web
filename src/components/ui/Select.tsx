'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';
import { controlStyles } from './Field';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  dotClassName?: string;
};

type SelectProps<T extends string> = {
  id?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
};

export function Select<T extends string>({ id, value, onValueChange, options, placeholder }: SelectProps<T>) {
  const selected = options.find((o) => o.value === value);
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onValueChange(v as T)}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(controlStyles, 'flex h-11 items-center justify-between gap-2 text-left data-[state=open]:ring-2 data-[state=open]:ring-spirit-500')}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected?.dotClassName ? <span className={cn('size-2 shrink-0 rounded-full', selected.dotClassName)} /> : null}
          <span className="truncate">
            <SelectPrimitive.Value placeholder={placeholder}>{selected?.label}</SelectPrimitive.Value>
          </span>
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-slate-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[80] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl bg-white p-1.5 shadow-soft-lg ring-1 ring-slate-200 motion-safe:animate-pop"
        >
          <SelectPrimitive.Viewport>
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-start gap-2.5 rounded-xl py-2.5 pl-3 pr-9 text-sm text-slate-800 outline-none data-[highlighted]:bg-slate-100"
              >
                {o.dotClassName ? <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', o.dotClassName)} /> : null}
                <span className="min-w-0">
                  <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                  {o.description ? <span className="block text-xs text-slate-500">{o.description}</span> : null}
                </span>
                <SelectPrimitive.ItemIndicator className="absolute right-3 top-3">
                  <Check className="size-4 text-spirit" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
