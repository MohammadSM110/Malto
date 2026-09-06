import React from 'react';
import { cn } from '../utils/cn.ts';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'interactive' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-150 relative text-start select-none';

    const variantStyles = {
      default: 'bg-white border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]',
      muted: 'bg-[#F8FAFC] border border-[#E2E8F0]',
      interactive:
        'bg-white border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:border-[#CBD5E1] hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.06)] cursor-pointer active:scale-[0.99]',
      outline: 'bg-transparent border border-[#E2E8F0] hover:border-[#CBD5E1]',
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
