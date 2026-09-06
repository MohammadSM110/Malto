import React from 'react';
import { cn } from '../utils/cn.ts';
import { AlertCircle, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  suffix?: string;
  prefix?: string;
  isClearable?: boolean;
  onClear?: () => void;
  optional?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      suffix,
      prefix,
      isClearable,
      onClear,
      optional,
      className,
      id,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-[#0F172A] select-none"
            >
              {label}
            </label>
            {optional && (
              <span className="text-[11px] text-[#94A3B8] font-normal">اختیاری</span>
            )}
          </div>
        )}

        <div className="relative flex items-center">
          {/* Start Icon / Prefix */}
          {startIcon && (
            <div className="absolute inset-inline-start-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {startIcon}
            </div>
          )}
          {prefix && (
            <div className="absolute inset-inline-start-3.5 flex items-center pointer-events-none text-xs text-[#64748B]">
              {prefix}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            value={value}
            disabled={disabled}
            className={cn(
              'w-full bg-white text-[#0F172A] text-sm rounded-xl border transition-all duration-150',
              'py-2.5 px-3.5 placeholder:text-[#94A3B8]',
              'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]',
              'disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed',
              error
                ? 'border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
                : 'border-[#E2E8F0] hover:border-[#CBD5E1]',
              startIcon || prefix ? 'ps-10' : '',
              endIcon || suffix || (isClearable && value) ? 'pe-10' : '',
              className
            )}
            {...props}
          />

          {/* Clear button if clearable and has value */}
          {isClearable && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-inline-end-3 p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              aria-label="پاک کردن"
            >
              <X size={14} />
            </button>
          )}

          {/* End Icon / Suffix (when not cleared) */}
          {(!isClearable || !value) && endIcon && (
            <div className="absolute inset-inline-end-3 flex items-center pointer-events-none text-[#94A3B8]">
              {endIcon}
            </div>
          )}
          {(!isClearable || !value) && suffix && (
            <div className="absolute inset-inline-end-3 flex items-center pointer-events-none text-xs text-[#64748B]">
              {suffix}
            </div>
          )}
        </div>

        {/* Error or Helper message */}
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

Input.displayName = 'Input';
