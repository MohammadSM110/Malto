import React from 'react';
import { cn } from '../utils/cn.ts';
import { AlertCircle } from 'lucide-react';
import { toPersianDigits } from '../utils/persian.ts';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  optional?: boolean;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      optional,
      maxLength,
      currentLength,
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const count = currentLength ?? (typeof value === 'string' ? value.length : 0);

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="text-xs font-medium text-[#0F172A] select-none"
            >
              {label}
            </label>
            <div className="flex items-center gap-2">
              {optional && (
                <span className="text-[11px] text-[#94A3B8] font-normal">اختیاری</span>
              )}
              {maxLength && (
                <span className="text-[11px] text-[#94A3B8] font-num">
                  {toPersianDigits(count)} / {toPersianDigits(maxLength)}
                </span>
              )}
            </div>
          </div>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          rows={4}
          className={cn(
            'w-full bg-white text-[#0F172A] text-sm rounded-xl border transition-all duration-150',
            'py-2.5 px-3.5 placeholder:text-[#94A3B8] resize-y min-h-[96px]',
            'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
            'disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed',
            error
              ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1]',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-[#DC2626] font-normal mt-0.5">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[12px] text-[#64748B] font-normal mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
