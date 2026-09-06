import React from 'react';
import { cn } from '../utils/cn.ts';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

export type BottomNavTab = 'home' | 'explore' | 'donate' | 'messages' | 'profile';

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
  const tabs: { id: BottomNavTab; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    {
      id: 'home',
      label: 'خانه',
      icon: <Home size={20} />,
    },
    {
      id: 'explore',
      label: 'کاوش',
      icon: <Compass size={20} />,
    },
    {
      id: 'donate',
      label: 'اهدا کردن',
      icon: <Plus size={22} className="stroke-[2.5]" />,
      isAction: true,
    },
    {
      id: 'messages',
      label: 'پیام‌ها',
      icon: <MessageSquare size={20} />,
    },
    {
      id: 'profile',
      label: 'پروفایل',
      icon: <User size={20} />,
    },
  ];

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
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          // Prominent center "اهدا کردن" button
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer"
                aria-label={tab.label}
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
                  {tab.icon}
                </div>
                <span className="text-[10px] font-semibold text-[#475569] mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 cursor-pointer',
                'active:scale-95 focus:outline-none',
                isActive
                  ? 'text-[#2563EB] font-bold'
                  : 'text-[#94A3B8] hover:text-[#0F172A]'
              )}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'messages' && messageBadgeCount > 0 && (
                  <span className="absolute -top-1 -inset-inline-end-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
