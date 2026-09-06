import React from 'react';
import { cn } from '../utils/cn.ts';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { Button } from './Button.tsx';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onDismiss,
  action,
  className,
}) => {
  const configs: Record<
    AlertType,
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    info: {
      bg: 'bg-[#EFF6FF]',
      border: 'border-[#BFDBFE]',
      text: 'text-[#1E40AF]',
      icon: <Info size={18} className="text-[#2563EB] shrink-0" />,
    },
    success: {
      bg: 'bg-[#DCFCE7]',
      border: 'border-[#BBF7D0]',
      text: 'text-[#166534]',
      icon: <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#FEF9C3]',
      border: 'border-[#FEF08A]',
      text: 'text-[#854D0E]',
      icon: <AlertTriangle size={18} className="text-[#CA8A04] shrink-0" />,
    },
    error: {
      bg: 'bg-[#FEE2E2]',
      border: 'border-[#FECACA]',
      text: 'text-[#991B1B]',
      icon: <AlertCircle size={18} className="text-[#DC2626] shrink-0" />,
    },
  };

  const current = configs[type];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border p-4 flex gap-3 items-start text-start transition-all',
        current.bg,
        current.border,
        className
      )}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className={cn('text-sm font-semibold mb-1', current.text)}>{title}</h4>}
        <div className={cn('text-xs leading-relaxed', current.text)}>{children}</div>
        {action && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                'text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer',
                current.text
              )}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn('p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer', current.text)}
          aria-label="بستن"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-[#E2E8F0] bg-white/70 p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
        {icon || <Gift size={28} className="stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-bold text-[#0F172A] mb-1.5">{title}</h3>
      <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'خطایی در دریافت اطلاعات رخ داد',
  message = 'ارتباط با سرور برقرار نشد یا لیست هدایا در دسترس نیست. لطفاً مجدداً تلاش کنید.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#FECACA] bg-[#FEE2E2] p-6 text-center flex flex-col items-center justify-center max-w-md mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white text-[#DC2626] flex items-center justify-center mb-3 shadow-xs">
        <AlertCircle size={24} />
      </div>
      <h4 className="text-sm font-bold text-[#991B1B] mb-1">{title}</h4>
      <p className="text-xs text-[#64748B] leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          startIcon={<RefreshCw size={14} />}
          className="border-[#FECACA] hover:bg-white"
        >
          تلاش دوباره
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#E2E8F0]/80 rounded-xl',
        className
      )}
    />
  );
};

/**
 * Skeleton Loader matching the horizontal Feed List Card from Figma
 */
export const DonationFeedCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] flex items-center justify-between gap-3 text-start">
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/5 rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
    </div>
  );
};
