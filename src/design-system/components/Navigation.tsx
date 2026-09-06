import React from 'react';
import { cn } from '../utils/cn.ts';
import { MapPin, Search, Bell, User, Globe, SlidersHorizontal, Heart, Plus, LogIn } from 'lucide-react';
import { CategoryPill } from './Badge.tsx';

export interface FeedHeaderProps {
  greeting?: string;
  location?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  categories?: { id: string; label: string }[];
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
  className?: string;
}

/**
 * Feed Header directly matching the Figma design screenshot:
 * 1. Warm Persian greeting: "کاربر عزیز امروز چی می‌خوای مالتو باشه:)"
 * 2. City & neighborhood indicator: "تهران / شهرک غرب" with pin icon
 * 3. Search input with "کمد لباس" style placeholder
 * 4. Horizontal category pills (همه, کتاب, مبلمان, سرگرمی, پوشیدنی, ابزار, کودک...)
 */
export const FeedHeader: React.FC<FeedHeaderProps> = ({
  greeting = 'کاربر عزیز امروز چی می‌خوای مالتو باشه:)',
  location = 'تهران / شهرک غرب',
  searchValue = '',
  onSearchChange,
  categories = [
    { id: 'all', label: 'همه' },
    { id: 'book', label: 'کتاب' },
    { id: 'furniture', label: 'مبلمان' },
    { id: 'entertainment', label: 'سرگرمی' },
    { id: 'clothing', label: 'پوشیدنی' },
    { id: 'tools', label: 'ابزار' },
    { id: 'kids', label: 'کودک' },
  ],
  activeCategory = 'all',
  onSelectCategory,
  className,
}) => {
  return (
    <header className={cn('w-full flex flex-col gap-3.5 text-start select-none', className)}>
      {/* Top row: Greeting & Location */}
      <div className="flex flex-col gap-1">
        <h1 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
          {greeting}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <MapPin size={14} className="text-[#64748B] shrink-0" />
          <span>{location}</span>
        </div>
      </div>

      {/* Search Input matching Figma */}
      <div className="relative w-full">
        <div className="absolute inset-inline-start-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#94A3B8]">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="کمد لباس، دوچرخه، کتاب..."
          className={cn(
            'w-full bg-white text-[#0F172A] text-sm rounded-2xl border border-[#E2E8F0]',
            'py-3 ps-11 pe-4 placeholder:text-[#94A3B8]',
            'shadow-[0_1px_2px_rgba(15,23,42,0.03)]',
            'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all'
          )}
        />
      </div>

      {/* Horizontal Category Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            isActive={activeCategory === cat.id}
            onClick={() => onSelectCategory?.(cat.id)}
          >
            {cat.label}
          </CategoryPill>
        ))}
      </div>
    </header>
  );
};

export interface HeaderProps {
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  unreadCount?: number;
  currentLang?: 'fa' | 'en';
  onToggleLang?: () => void;
  onDonateClick?: () => void;
  user?: { displayName?: string; email?: string } | null;
  isAuthenticated?: boolean;
  className?: string;
}

/**
 * Desktop & Tablet Navigation Bar for the Maalto platform
 */
export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onNotificationsClick,
  onProfileClick,
  unreadCount = 2,
  currentLang = 'fa',
  onToggleLang,
  onDonateClick,
  user,
  isAuthenticated = false,
  className,
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#E2E8F0] transition-colors select-none',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs font-bold text-base">
              م
            </div>
            <div className="flex flex-col text-start">
              <span className="font-extrabold tracking-tight text-lg text-[#0F172A] leading-none">
                مالتو • Maalto
              </span>
              <span className="text-[10px] tracking-wide text-[#64748B] font-medium leading-tight">
                پلتفرم اهدای رایگان کالا
              </span>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div
            onClick={onSearchClick}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl cursor-pointer shadow-xs text-sm text-[#94A3B8] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Search size={16} className="text-[#94A3B8]" />
              <span>جستجو در وسایل اهدایی، کتاب، دوچرخه، مبلمان...</span>
            </div>
            <span className="text-[11px] bg-[#F1F5F9] text-[#64748B] px-1.5 py-0.5 rounded font-mono">
              رایگان
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Donate CTA button */}
          {onDonateClick && (
            <button
              type="button"
              onClick={onDonateClick}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#2563EB] text-white px-3.5 py-2 rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-xs"
            >
              <Plus size={16} />
              <span>ثبت هدیه رایگان</span>
            </button>
          )}

          {/* Language / RTL Preview Toggle */}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl border border-transparent hover:border-[#E2E8F0] transition-colors"
              title="تغییر جهت و زبان (آزمایش RTL/LTR)"
            >
              <Globe size={15} />
              <span className="font-mono uppercase">{currentLang === 'fa' ? 'FA (RTL)' : 'EN (LTR)'}</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
            aria-label="اعلان‌ها"
          >
            <Bell size={20} />
            {unreadCount > 0 && isAuthenticated && (
              <span className="absolute top-1.5 inset-inline-end-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Avatar / Sign in CTA */}
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-2 p-1 pe-2.5 text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors border border-[#E2E8F0] cursor-pointer"
              aria-label="پروفایل کاربری"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {user.displayName ? user.displayName.charAt(0) : 'م'}
              </div>
              <span className="text-xs font-bold hidden sm:inline-block max-w-[120px] truncate">
                {user.displayName}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] px-3 py-2 rounded-xl border border-[#CBD5E1] shadow-2xs transition-colors cursor-pointer"
            >
              <LogIn size={15} className="text-[#2563EB]" />
              <span className="font-bold">ورود / هویت</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
