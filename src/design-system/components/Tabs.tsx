import React from 'react';
import { cn } from '../utils/cn.ts';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 select-none',
        variant === 'underline' ? 'border-b border-[#E2E8F0]' : '',
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;

        if (variant === 'underline') {
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'relative pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 focus:outline-none cursor-pointer',
                isActive
                  ? 'text-[#2563EB] font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-num',
                    isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#64748B]'
                  )}
                >
                  {item.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563EB] rounded-full" />
              )}
            </button>
          );
        }

        // Pill variant
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-150 whitespace-nowrap flex items-center gap-2 focus:outline-none active:scale-95 cursor-pointer',
              isActive
                ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                : 'bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-[#E2E8F0]'
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-num',
                  isActive ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
