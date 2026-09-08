import React from 'react';
import {
  Home,
  Compass,
  Plus,
  MessageSquare,
  User,
  Sparkles,
  Shirt,
  Armchair,
  BookOpen,
  Baby,
  Gamepad2,
  Wrench,
  Flower2,
} from 'lucide-react';

export type RouteId = 'home' | 'explore' | 'donate' | 'messages' | 'profile';

export interface NavItemConfig {
  id: RouteId;
  label: string;
  englishLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  isAction?: boolean;
  requiresAuth?: boolean;
}

/**
 * Single source of truth for Navigation items, routes, and bottom navigation.
 * Changing labels, icons, or route titles here centrally updates BottomNav, Header, and page headings.
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'خانه',
    englishLabel: 'Home',
    icon: Home,
    title: 'خانه • فید اهدای رایگان کالا',
    description: 'جدیدترین هدایای اهدایی هم‌محله‌ای‌ها',
    isAction: false,
    requiresAuth: false,
  },
  {
    id: 'explore',
    label: 'کاوش',
    englishLabel: 'Explore',
    icon: Compass,
    title: 'کاوش و جستجوی کالاها',
    description: 'فیلتر بر اساس دسته‌بندی، محله و وضعیت سلامت کالا',
    isAction: false,
    requiresAuth: false,
  },
  {
    id: 'donate',
    label: 'اهدا کردن',
    englishLabel: 'Donate',
    icon: Plus,
    title: 'ثبت هدیه جدید برای اهدای رایگان',
    description: 'انتشار آگهی هدیه بدون هیچ هزینه یا کمیسیون',
    isAction: true,
    requiresAuth: true,
  },
  {
    id: 'messages',
    label: 'پیام‌ها',
    englishLabel: 'Messages',
    icon: MessageSquare,
    title: 'پیام‌ها و درخواست‌های اهدا',
    description: 'گفتگو، هماهنگی تحویل و بررسی درخواست‌های متقاضیان',
    isAction: false,
    requiresAuth: true,
  },
  {
    id: 'profile',
    label: 'پروفایل',
    englishLabel: 'Profile',
    icon: User,
    title: 'حساب کاربری و سوابق',
    description: 'مشاهده کالاهای اهدا شده، هدایای دریافتی و تنظیمات حساب',
    isAction: false,
    requiresAuth: true,
  },
];

export const getNavItem = (id: RouteId): NavItemConfig => {
  return NAV_ITEMS.find((item) => item.id === id) || NAV_ITEMS[0];
};

export const getRouteTitle = (id: RouteId): string => {
  return getNavItem(id).title;
};

/**
 * Central application-wide branding and static copy configuration.
 */
export const APP_CONFIG = {
  name: 'مالتو • Maalto',
  englishName: 'Maalto',
  tagline: 'پلتفرم اهدای رایگان کالا',
  freeBadge: '۱۰۰٪ رایگان',
  greeting: 'کاربر عزیز امروز چی میخوای مال تو باشه :)',
  defaultLocation: 'تهران / شهرک غرب',
  defaultCity: 'تهران',
  defaultDistrict: 'شهرک غرب',
  searchPlaceholder: 'کمد لباس، دوچرخه، کتاب...',
  goldenRuleNotice: 'مالتو ۱۰۰٪ رایگان است',
  goldenRuleSub: 'بدون هزینه و فروش',
  goldenRuleTitle: 'تعهد به اهدای ۱۰۰٪ رایگان در مالتو',
  goldenRuleDescription:
    'مالتو یک پلتفرم اهدای رایگان است. هرگونه خرید، فروش، تعیین قیمت، پیشنهاد وجه نقد یا دریافت هزینه کارشناسی و واسطه‌گری در مالتو اکیداً ممنوع می‌باشد.',
} as const;

export interface CategoryConfig {
  id: string;
  label: string;
  feedLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/**
 * Single source of truth for categories across FeedHeader, ExplorePage, and AddItemFlow.
 */
export const CATEGORIES_CONFIG: CategoryConfig[] = [
  { id: 'all', label: 'همه دسته‌ها', feedLabel: 'همه', icon: Sparkles },
  { id: 'clothing', label: 'پوشیدنی و لباس', feedLabel: 'پوشیدنی', icon: Shirt },
  { id: 'home', label: 'مبلمان و لوازم خانه', feedLabel: 'مبلمان', icon: Armchair },
  { id: 'books', label: 'کتاب و آموزش', feedLabel: 'کتاب', icon: BookOpen },
  { id: 'kids', label: 'کودک و نوزاد', feedLabel: 'کودک', icon: Baby },
  { id: 'entertainment', label: 'سرگرمی و ورزش', feedLabel: 'سرگرمی', icon: Gamepad2 },
  { id: 'tools', label: 'ابزار و فنی', feedLabel: 'ابزار', icon: Wrench },
  { id: 'plants', label: 'گل و گیاه آپارتمانی', feedLabel: 'گل و گیاه', icon: Flower2 },
];
