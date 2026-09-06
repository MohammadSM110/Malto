import React from 'react';
import { cn } from '../utils/cn.ts';
import { X } from 'lucide-react';

export type ConditionType = 'سالم' | 'کاملاً نو' | 'در حد نو' | 'نیازمند تعمیر' | 'دست‌ساز' | string;

export interface ConditionBadgeProps {
  condition: ConditionType;
  className?: string;
}

/**
 * Condition Badge matching the Figma design:
 * Soft translucent slate container with subtle technical border ("سالم")
 */
export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  condition = 'سالم',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5 rounded-lg',
        'bg-[#94A3B8]/20 text-[#334155] border border-[#CBD5E1]/70 backdrop-blur-xs select-none',
        className
      )}
    >
      {condition}
    </span>
  );
};

export interface CategoryPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  children: React.ReactNode;
}

/**
 * Horizontal Category Pill matching the Figma design:
 * Active: Solid Electric Blue (#2563EB) with crisp white text
 * Inactive: Crisp white with soft slate border (#E2E8F0) and slate text (#475569)
 */
export const CategoryPill: React.FC<CategoryPillProps> = ({
  isActive = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-full transition-all duration-150 whitespace-nowrap select-none active:scale-95 cursor-pointer',
        isActive
          ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
          : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  hasDot?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  hasDot = false,
  onRemove,
  children,
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot?: string }> = {
    neutral: {
      container: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
      dot: 'bg-[#94A3B8]',
    },
    brand: {
      container: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
      dot: 'bg-[#2563EB]',
    },
    success: {
      container: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]',
      dot: 'bg-[#22C55E]',
    },
    warning: {
      container: 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]',
      dot: 'bg-[#EAB308]',
    },
    error: {
      container: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
      dot: 'bg-[#EF4444]',
    },
    outline: {
      container: 'bg-transparent text-[#475569] border border-[#CBD5E1]',
      dot: 'bg-[#64748B]',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg',
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium select-none whitespace-nowrap transition-colors',
        current.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {hasDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', current.dot)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 -me-1 rounded hover:bg-black/5 transition-colors focus:outline-none"
          aria-label="حذف فیلتر"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

export interface TagChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  count?: number | string;
  icon?: React.ReactNode;
}

export const TagChip: React.FC<TagChipProps> = ({
  isSelected = false,
  count,
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl transition-all duration-150 select-none whitespace-nowrap cursor-pointer',
        'border active:scale-[0.98]',
        isSelected
          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
          : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A] hover:bg-[#F8FAFC]',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.2 rounded-full font-num',
            isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
