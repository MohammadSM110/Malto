import React from 'react';
import { cn } from '../utils/cn.ts';
import { NAV_ITEMS, RouteId } from '../config/navigation.ts';
import { toPersianDigits } from '../utils/persian.ts';

export type BottomNavTab = RouteId;

export interface BottomNavigationProps {
  activeTab?: BottomNavTab;
  onTabChange?: (tab: BottomNavTab) => void;
  messageBadgeCount?: number;
  className?: string;
  isFixed?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'home',
  onTabChange,
  messageBadgeCount = 1,
  className,
  isFixed = true,
}) => {
  return (
    <nav
      className={cn(
        'w-full bg-white/95 backdrop-blur-md border-t border-[#E2E8F0]',
        'shadow-[0_-4px_16px_rgba(15,23,42,0.04)] select-none',
        isFixed ? 'fixed bottom-0 inset-x-0 z-40' : 'relative',
        className
      )}
      aria-label="ناوبری اصلی مالتو"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          // Prominent center "اهدا کردن" button
          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-150',
                    'shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-95',
                    isActive
                      ? 'bg-[#1D4ED8] ring-4 ring-[#2563EB]/20'
                      : 'bg-[#2563EB] group-hover:bg-[#1D4ED8]'
                  )}
                >
                  <IconComponent size={22} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-[#475569] mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 cursor-pointer',
                'active:scale-95 focus:outline-none',
                isActive
                  ? 'text-[#2563EB] font-bold'
                  : 'text-[#94A3B8] hover:text-[#0F172A]'
              )}
            >
              <div className="relative">
                <IconComponent size={20} />
                {item.id === 'messages' && messageBadgeCount > 0 && (
                  <span className="absolute -top-1.5 -inset-inline-end-2.5 min-w-[17px] h-4 px-1 rounded-full bg-[#2563EB] text-white text-[9px] font-num font-bold flex items-center justify-center ring-2 ring-white shadow-2xs">
                    {toPersianDigits(messageBadgeCount > 9 ? '+9' : messageBadgeCount)}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

