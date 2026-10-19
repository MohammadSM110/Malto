import React, { useState } from 'react';
import { Button } from '../design-system/components/Button.tsx';
import { ConditionBadge } from '../design-system/components/Badge.tsx';
import { EXPLORE_ITEMS, ExploreItem } from '../data/exploreData.ts';
import { toPersianDigits } from '../design-system/utils/persian.ts';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  MapPin,
  Gift,
  CheckCircle2,
  RefreshCw,
  Search,
  MessageSquare,
  Shield,
  Leaf,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';

export interface LandingPageProps {
  onEnterApp: (options?: { tab?: 'home' | 'explore' | 'messages' | 'profile'; action?: 'donate'; itemId?: string }) => void;
  onNavigateToAdmin?: () => void;
}

interface LandingPreviewItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  location: string;
  imageUrl: string;
  categoryLabel: string;
  donorName: string;
  timeAgo: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onNavigateToAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeExpTab, setActiveExpTab] = useState<'discover' | 'detail' | 'request' | 'handover'>('discover');

  // Representative items from real Maltoo catalog
  const featuredHeroItem: LandingPreviewItem = EXPLORE_ITEMS[0] || {
    id: 'exp-stroller-01',
    title: 'کالسکه تاشو مسافرتی کودک برند Goodbaby سبک',
    description: 'کالسکه تمیز با چرخ‌های ۳۶۰ درجه و سایه‌بان تابستانی. فرزندم بزرگ شده و تقدیم خانواده‌ای نیازمند می‌شود.',
    condition: 'در حد نو',
    location: 'تهران / شهرک غرب',
    imageUrl: '/images/items/baby-stroller.jpg',
    categoryLabel: 'کودک و نوزاد',
    donorName: 'سارا فراهانی',
    timeAgo: '۱۵ دقیقه پیش',
  };

  const sampleItems: LandingPreviewItem[] = [
    featuredHeroItem,
    EXPLORE_ITEMS[2] || {
      id: 'exp-books-01',
      title: 'مجموعه کتاب‌های رمان و ادبیات کلاسیک جهان',
      description: '۱۲ جلد کتاب نفیس رمان با صحافی تمیز جهت استفاده رایگان علاقه‌مندان به مطالعه.',
      condition: 'سالم',
      location: 'تهران / پونک',
      imageUrl: '/images/items/books-app.jpg',
      categoryLabel: 'کتاب و آموزش',
      donorName: 'دکتر بهرامی',
      timeAgo: '۲ روز پیش',
    },
    EXPLORE_ITEMS[3] || {
      id: 'exp-desk-01',
      title: 'میز مطالعه و تحریر چوبی تاشو کم‌جا',
      description: 'میز کار چوبی سبک با پایه‌های فلزی مقاوم، مناسب اتاق مطالعه یا دانش‌آموز.',
      condition: 'در حد نو',
      location: 'تهران / سعادت‌آباد',
      imageUrl: '/images/items/study-table.jpg',
      categoryLabel: 'مبلمان و خانه',
      donorName: 'امیرحسین پارسا',
      timeAgo: 'امروز',
    },
    EXPLORE_ITEMS[4] || {
      id: 'exp-guitar-01',
      title: 'گیتار کلاسیک یاماها مدل C40 با کاور',
      description: 'ساز تمیز همراه کاور ضدآب، اهدای رایگان به هنرجوی مبتدی و علاقه‌مند به موسیقی.',
      condition: 'سالم',
      location: 'تهران / ستارخان',
      imageUrl: '/images/items/acoustic-guitar.jpg',
      categoryLabel: 'سرگرمی و هنر',
      donorName: 'نیما علیزاده',
      timeAgo: '۳ روز پیش',
    },
  ];

  const categoriesShowcase = [
    {
      id: 'books',
      title: 'کتاب و آموزش',
      description: 'رمان‌ها، کتاب‌های کنکور، منابع دانشگاهی و داستان کودک',
      image: '/images/items/books-app.jpg',
      example: 'مجموعه رمان‌های کلاسیک',
      condition: 'سالم',
      donor: 'اهدا به کتاب‌دوستان',
    },
    {
      id: 'kids',
      title: 'کودک و نوزاد',
      description: 'کالسکه، صندلی ماشین، اسباب‌بازی و لباس‌های نوزادی',
      image: '/images/items/baby-stroller.jpg',
      example: 'کالسکه تاشو مسافرتی',
      condition: 'در حد نو',
      donor: 'تقدیم به خانواده‌ها',
    },
    {
      id: 'home',
      title: 'مبلمان و مطالعه',
      description: 'میز کار، صندلی ارگونومیک، چراغ مطالعه و قفسه کتاب',
      image: '/images/items/study-table.jpg',
      example: 'میز مطالعه چوبی کم‌جا',
      condition: 'در حد نو',
      donor: 'برای اتاق کار یا مطالعه',
    },
    {
      id: 'house',
      title: 'لوازم خانه و روشنایی',
      description: 'چراغ رومیزی، کتری برقی، ظروف تمیز و وسایل آشپزخانه',
      image: '/images/items/desk-lamp.jpg',
      example: 'چراغ مطالعه فلزی تنظیم‌پذیر',
      condition: 'سالم',
      donor: 'وسایل باکیفیت منزل',
    },
    {
      id: 'tools',
      title: 'ابزار و فنی',
      description: 'جعبه آچار، دریل خانگی، ابزار تعمیرات و اتصالات',
      image: '/images/items/mechanic-tools.jpg',
      example: 'ست ابزار مکانیک و آچار',
      condition: 'سالم',
      donor: 'دست‌به‌دست در محله',
    },
    {
      id: 'plants',
      title: 'گیاه، ورزش و سرگرمی',
      description: 'گیاهان آپارتمانی، گیتار و سازها، مت یوگا و وسایل ورزش',
      image: '/images/items/sansevieria-plant.jpg',
      example: 'گلدان بزرگ سانسوریا ابلق',
      condition: 'شاداب و نو',
      donor: 'هدیه سبز به خانه دیگر',
    },
  ];

  const experienceSteps = [
    {
      id: 'discover' as const,
      label: '۱. دیدن هدایا در محله',
      title: 'کشف هدایای موجود در شهر و محله شما',
      description: 'فید زنده مالتو وسایل اهدایی نزدیک‌ترین همسایه‌ها را نشان می‌دهد. بدون قیمت، بدون دلال و بدون تبلیغات خسته‌کننده.',
      tag: 'بدون قیمت • فقط مهربانی',
      screen: {
        header: 'هدایای شهر تهران',
        sub: 'مرور وسایل اهدایی آماده تحویل',
        mockItem: {
          title: 'دوچرخه در حد نو سایز ۲۶',
          loc: 'تهران / مرکز شهر',
          donor: 'محمدرضا کاظمی',
          badge: 'سالم',
          img: '/images/items/hero-bike.jpg',
        },
      },
    },
    {
      id: 'detail' as const,
      label: '۲. بررسی مشخصات و سلامت',
      title: 'مشاهده مشخصات دقیق و علت اهدا',
      description: 'اهداکننده عکس‌های واقعی از شیء، وضعیت سلامت ظاهری و فنی و توضیحات نحوه تحویل را ثبت کرده است.',
      tag: 'شفافیت کامل • بدون سوءتفاهم',
      screen: {
        header: 'جزییات هدیه',
        sub: 'وضعیت فنی و مشخصات سلامت',
        mockItem: {
          title: 'میز مطالعه و تحریر چوبی تاشو',
          loc: 'تهران / سعادت‌آباد',
          donor: 'امیرحسین پارسا',
          badge: 'در حد نو',
          img: '/images/items/study-table.jpg',
        },
      },
    },
    {
      id: 'request' as const,
      label: '۳. درخواست مستقیم و محترمانه',
      title: 'ارسال پیام به اهداکننده با یک کلیک',
      description: 'اگر واقعاً به وسیله نیاز دارید، دکمه درخواست را می‌زنید و پیامی کوتاه برای هماهنگی تحویل برای صاحب وسیله می‌فرستید.',
      tag: 'ارتباط مستقیم • بدون واسطه',
      screen: {
        header: 'ارسال درخواست هدیه',
        sub: 'پیام هماهنگی به صاحب وسیله',
        mockItem: {
          title: 'مجموعه کتاب‌های رمان کلاسیک',
          loc: 'تهران / پونک',
          donor: 'دکتر بهرامی',
          badge: 'سالم',
          img: '/images/items/books-app.jpg',
        },
      },
    },
    {
      id: 'handover' as const,
      label: '۴. تحویل دست‌به‌دست',
      title: 'زندگی دوباره برای وسیله‌ای که خاک می‌خورد',
      description: 'تحویل به‌صورت حضوری در محله یا با پیک انجام می‌شود. وسیله به جای دور ریخته شدن یا گوشه‌نشینی، لبخند می‌آفریند.',
      tag: 'پایان خاک خوردن • آغاز زندگی نو',
      screen: {
        header: 'تحویل با موفقیت انجام شد',
        sub: 'وسیله به دست متقاضی رسید',
        mockItem: {
          title: 'کالسکه تاشو سبک Goodbaby',
          loc: 'تهران / شهرک غرب',
          donor: 'سارا فراهانی',
          badge: 'اهدا شد',
          img: '/images/items/baby-stroller.jpg',
        },
      },
    },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-persian antialiased selection:bg-[#2563EB] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP BAR CONTRACT: STRICT 3-ZONE LAYOUT */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Single Brand Element Wordmark & Logo */}
          <div className="flex items-center gap-3">
            <a
              href="/landing"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[#2563EB] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/logo.png"
                  alt="مالتو"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.jpg';
                  }}
                />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                مالتو
              </span>
            </a>
          </div>

          {/* Zone 2: 4-5 Clean Text Nav Links with subtle underlines */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475569]">
            <button
              type="button"
              onClick={() => scrollToSection('the-idea')}
              className="hover:text-[#0F172A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              ایده مالتو
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#0F172A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              نحوه کارکرد
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('what-to-give')}
              className="hover:text-[#0F172A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              چه چیزهایی؟
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('the-experience')}
              className="hover:text-[#0F172A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              تجربه استفاده
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('why-maltoo')}
              className="hover:text-[#0F172A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              چرا مالتو
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onEnterApp({ action: 'donate' })}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl border border-[#BFDBFE]/70 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>ثبت هدیه</span>
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={() => onEnterApp()}
              endIcon={<ArrowLeft size={16} />}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap cursor-pointer"
            >
              ورود به مالتو
            </Button>

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#475569] hover:bg-[#F1F5F9] focus:outline-none cursor-pointer"
              aria-label="منوی سایت"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 flex flex-col gap-3 text-start shadow-md animate-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => scrollToSection('the-idea')}
              className="text-sm font-medium text-[#334155] py-2 hover:text-[#2563EB] cursor-pointer"
            >
              ایده مالتو
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-[#334155] py-2 hover:text-[#2563EB] cursor-pointer"
            >
              نحوه کارکرد مالتو
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('what-to-give')}
              className="text-sm font-medium text-[#334155] py-2 hover:text-[#2563EB] cursor-pointer"
            >
              چه چیزهایی می‌توان بخشید؟
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('the-experience')}
              className="text-sm font-medium text-[#334155] py-2 hover:text-[#2563EB] cursor-pointer"
            >
              تجربه استفاده از محصول
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('why-maltoo')}
              className="text-sm font-medium text-[#334155] py-2 hover:text-[#2563EB] cursor-pointer"
            >
              چرا مالتو؟
            </button>
            <div className="pt-2 border-t border-[#F1F5F9] flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterApp();
                }}
                endIcon={<ArrowLeft size={16} />}
                className="w-full text-xs font-bold"
              >
                ورود به مالتو و مشاهده هدایا
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterApp({ action: 'donate' });
                }}
                startIcon={<Plus size={14} />}
                className="w-full text-xs"
              >
                ثبت وسیله اهدایی جدید
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: VISUALLY STRIKING, EMOTIONAL & PRODUCT-CENTERED */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-[#E2E8F0] bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9]/50">
        {/* Subtle radial ambient highlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left/Start Column: Typography, Value Proposition & Conversion (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-start">
              {/* Zero-Pill Metadata Lead-in with dot separators */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2563EB] mb-4">
                <span>پلتفرم رایگان جابه‌جایی وسایل</span>
                <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                <span>بدون خرید و فروش</span>
                <span aria-hidden="true" className="text-[#94A3B8]">·</span>
                <span>دست‌به‌دست در محله</span>
              </div>

              {/* Memorable Persian Display Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.25] sm:leading-[1.2] mb-6 max-w-2xl text-balance">
                چیزی که برای تو اضافه‌ست،
                <span className="block text-[#2563EB] mt-1 sm:mt-2">
                  شاید برای یکی دیگه لازم باشه.
                </span>
              </h1>

              {/* Clear, concrete value proposition without corporate fluff */}
              <p className="text-base sm:text-lg text-[#475569] leading-relaxed mb-8 max-w-xl">
                مالتو جایی است برای سپردن وسایلی که دیگر نیاز ندارید به کسانی که در اطراف شما به آن‌ها احتیاج دارند.
                <strong className="text-[#0F172A] font-semibold"> بدون قیمت، بدون دلال و بدون هیچ معامله تجاری.</strong>
              </p>

              {/* Action Block */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onEnterApp()}
                  endIcon={<ArrowLeft size={18} />}
                  className="font-bold text-sm sm:text-base px-7 py-3.5 shadow-sm hover:shadow cursor-pointer"
                >
                  ورود به مالتو و شروع
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onEnterApp({ action: 'donate' })}
                  startIcon={<Gift size={18} className="text-[#2563EB]" />}
                  className="font-semibold text-sm sm:text-base px-6 py-3.5 bg-white hover:bg-[#F8FAFC] cursor-pointer"
                >
                  ثبت وسیله اهدایی
                </Button>
              </div>

              {/* Clean Proof & Trust Markers (No fake stats, real principles) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0] w-full">
                <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                  <CheckCircle2 size={15} className="text-[#16A34A]" />
                  <span>۱۰۰٪ رایگان برای همیشه</span>
                </span>
                <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-[#2563EB]" />
                  <span>بدون درگاه پرداخت و بدون کارمزد</span>
                </span>
                <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#64748B]" />
                  <span>ارتباط مستقیم در شهر و محله</span>
                </span>
              </div>
            </div>

            {/* Right/End Column: Real Maltoo Product Interface Mockup (5 cols) */}
            <div className="lg:col-span-5 relative w-full">
              {/* Product Card Container with single-level elevation & hairline border */}
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-3xl p-3 sm:p-4 border border-[#E2E8F0] shadow-md transition-all">
                {/* Simulated Maltoo App Header */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/80 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      م
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">مالتو • فید زنده محله</div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <MapPin size={11} className="text-[#2563EB]" />
                        <span>تهران • شهرک غرب و محله‌های نزدیک</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                    هدایای فعال
                  </span>
                </div>

                {/* Hero Featured Item Preview */}
                <div
                  onClick={() => onEnterApp({ itemId: featuredHeroItem.id })}
                  className="group relative rounded-2xl overflow-hidden border border-[#E2E8F0] aspect-[16/10] bg-slate-900 cursor-pointer shadow-xs"
                >
                  <img
                    src={featuredHeroItem.imageUrl}
                    alt={featuredHeroItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <ConditionBadge condition={featuredHeroItem.condition} />
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    ۱۰۰٪ رایگان
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5 text-white text-start">
                    <div className="text-xs sm:text-sm font-bold truncate group-hover:text-blue-200 transition-colors">
                      {featuredHeroItem.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/80 mt-1">
                      <span>{featuredHeroItem.donorName}</span>
                      <span className="text-white/60 font-num">{featuredHeroItem.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Feed Items Stack (Real Product List) */}
                <div className="mt-3 flex flex-col gap-2">
                  {sampleItems.slice(1, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onEnterApp({ itemId: item.id })}
                      className="group p-2.5 bg-[#F8FAFC] hover:bg-white rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] transition-all flex items-center justify-between gap-3 text-start cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] text-[#2563EB] font-bold bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[10px] text-[#64748B] truncate">{item.location}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#E2E8F0]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Subtle Interactive Trigger Button inside mockup */}
                <button
                  type="button"
                  onClick={() => onEnterApp()}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>مشاهده همه هدایای شهر شما در اپلیکیشن</span>
                  <ArrowLeft size={14} />
                </button>
              </div>

              {/* Decorative Floating Micro-Card */}
              <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-white rounded-2xl p-3 border border-[#E2E8F0] shadow-lg items-center gap-2.5 max-w-[220px] text-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Heart size={16} className="fill-[#2563EB]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#0F172A]">چرخه دست‌به‌دست</div>
                  <div className="text-[10px] text-[#64748B]">بدون رد پای خرید و فروش</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE IDEA: CONCISE, HUMAN & AUTHENTIC */}
      {/* ========================================================================= */}
      <section id="the-idea" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
            ایده شکل‌گیری مالتو
          </span>

          <blockquote className="text-2xl sm:text-4xl font-black text-[#0F172A] leading-snug sm:leading-tight mb-8 text-balance">
            «یه سری چیزها برای ما دیگه استفاده‌ای ندارن،
            <br className="hidden sm:inline" />
            ولی هنوز می‌تونن برای یکی دیگه مفید باشن.»
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start mt-10">
            {/* Box 1: Problem */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-4">
                ۱
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                انبار شدن وسایل مفید در گوشه خانه‌ها
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                میز تحریری که کودک از آن گذشته، کتاب‌هایی که بارها خوانده شده‌اند، یا ساز و دوچرخه‌ای که فرصت استفاده‌شان را نداریم. این وسایل خراب نیستند؛ فقط کارشان در خانه ما تمام شده است.
              </p>
            </div>

            {/* Box 2: Maltoo's Answer */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-4">
                ۲
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                وصل کردن بی‌واسطه به دست‌های مشتاق
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                چند کوچه آن‌طرف‌تر، دانش‌آموزی به همان میز نیاز دارد یا هنرجویی در جستجوی همان گیتار است. مالتو فاصله این دو نفر را بدون قیمت، چانه‌زنی و دلال صفر می‌کند.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW MALTOO WORKS: SIMPLE 3-STEP VISUAL STORY */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
              نحوه کارکرد مالتو
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-3">
              سه گام تا زندگی دوباره یک وسیله
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              همه‌چیز به سادگی یک گفتگوی محلی طراحی شده است؛ بدون فرم‌های پیچیده تجاری و بدون کارمزد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-xs flex flex-col justify-between text-start relative group hover:border-[#BFDBFE] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                    گام اول
                  </span>
                  <span className="text-2xl font-black text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors">
                    ۰۱
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  «اضافه‌ست؟»
                </h3>
                <h4 className="text-sm font-semibold text-[#2563EB] mb-3">
                  چیزی که دیگه لازم نداری رو معرفی کن
                </h4>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  یک یا چند عکس با گوشی بگیر، سلامت وسیله و محله خودت رو بنویس و بدون هیچ قیمت یا هزینه‌ای ثبتش کن. کمتر از یک دقیقه وقت می‌بره.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>بدون دردسر کارشناسی و قیمت‌گذاری</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-xs flex flex-col justify-between text-start relative group hover:border-[#BFDBFE] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                    گام دوم
                  </span>
                  <span className="text-2xl font-black text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors">
                    ۰۲
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  «یکی پیداش می‌کنه»
                </h3>
                <h4 className="text-sm font-semibold text-[#2563EB] mb-3">
                  آدم‌های نزدیک می‌تونن ببیننش
                </h4>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  وسیله در فید محله و شهر شما به نمایش درمی‌آید. متقاضیان واقعی که به آن احتیاج دارند، مشخصات را می‌بینند و پیام درخواست ارسال می‌کنند.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>بر اساس دسته‌بندی و نزدیکی جغرافیایی</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-xs flex flex-col justify-between text-start relative group hover:border-[#BFDBFE] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                    گام سوم
                  </span>
                  <span className="text-2xl font-black text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors">
                    ۰۳
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  «دوباره استفاده میشه»
                </h3>
                <h4 className="text-sm font-semibold text-[#2563EB] mb-3">
                  وسیله به زندگی برمی‌گرده
                </h4>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  هماهنگی تحویل به‌صورت حضوری یا با پیک در پیام‌رسان انجام می‌شود. وسیله‌ای که قرار بود خاک بخورد، دوباره سودمند و الهام‌بخش می‌شود.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>حس خوب بخشش و کاهش هدررفت</span>
              </div>
            </div>
          </div>

          {/* Quick CTA to experience the flow */}
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => onEnterApp()}
              endIcon={<ArrowLeft size={16} />}
              className="text-xs sm:text-sm font-bold bg-white"
            >
              دیدن این تجربه به صورت زنده در مالتو
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHAT CAN YOU GIVE? (چه چیزهایی می‌توانید ببخشید؟) */}
      {/* ========================================================================= */}
      <section id="what-to-give" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 text-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
                تنوع اقلام اهدایی
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                چه چیزهایی می‌توان در مالتو بخشید؟
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md">
              هر وسیله سالمی که روزی با اشتیاق خریده‌اید، اکنون می‌تواند آغازگر تجربه تازه‌ای برای فرد دیگری باشد.
            </p>
          </div>

          {/* 6 Category Showcase Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoriesShowcase.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onEnterApp({ tab: 'explore' })}
                className="group bg-[#F8FAFC] hover:bg-white rounded-3xl p-4 border border-[#E2E8F0] hover:border-[#BFDBFE] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-start cursor-pointer select-none"
              >
                <div>
                  {/* Photo with condition pill */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-[#E2E8F0]/70">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <ConditionBadge condition={cat.condition} />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                      اهدای رایگان
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-1.5">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#475569]">
                  <span className="font-medium text-[#0F172A] truncate">مثال: {cat.example}</span>
                  <span className="text-[#2563EB] font-semibold shrink-0 group-hover:-translate-x-0.5 transition-transform">
                    مشاهده در کاوش ←
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE MALTOO EXPERIENCE: REAL PRODUCT WALKTHROUGH */}
      {/* ========================================================================= */}
      <section id="the-experience" className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
              رابط کاربری واقعی
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-3">
              تجربه کار با مالتو؛ به همین سادگی
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              بدون سبد خرید، بدون پیچیدگی و بدون درگاه پرداخت. همه تعاملات برای راحتی شما بهینه‌سازی شده‌اند.
            </p>
          </div>

          {/* Interactive Steps Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl mx-auto mb-8 p-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            {experienceSteps.map((step) => {
              const isActive = activeExpTab === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveExpTab(step.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer truncate ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Frame */}
          {(() => {
            const currentExp = experienceSteps.find((s) => s.id === activeExpTab) || experienceSteps[0];
            return (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2E8F0] shadow-sm max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-start">
                  {/* Explanation Column (6 cols) */}
                  <div className="md:col-span-6 flex flex-col justify-center">
                    <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE] w-fit mb-3">
                      {currentExp.tag}
                    </span>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-3">
                      {currentExp.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-6">
                      {currentExp.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onEnterApp()}
                        endIcon={<ArrowLeft size={16} />}
                        className="font-bold text-xs sm:text-sm"
                      >
                        امتحان این مرحله در برنامه
                      </Button>
                    </div>
                  </div>

                  {/* Mock Screen UI Representation (6 cols) */}
                  <div className="md:col-span-6 bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0] text-xs">
                      <div>
                        <span className="font-bold text-[#0F172A] block">{currentExp.screen.header}</span>
                        <span className="text-[11px] text-[#64748B]">{currentExp.screen.sub}</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    </div>

                    {/* Interactive Mock Card */}
                    <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs flex items-center gap-3">
                      <img
                        src={currentExp.screen.mockItem.img}
                        alt={currentExp.screen.mockItem.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#E2E8F0]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-[#0F172A] truncate">
                            {currentExp.screen.mockItem.title}
                          </h4>
                          <ConditionBadge condition={currentExp.screen.mockItem.badge} />
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          {currentExp.screen.mockItem.loc}
                        </div>
                        <div className="text-[10px] text-[#2563EB] font-medium mt-1">
                          اهداکننده: {currentExp.screen.mockItem.donor}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#1E40AF] flex items-center justify-between">
                      <span>وضعیت پرداخت در مالتو:</span>
                      <strong className="font-bold text-[#2563EB]">کاملاً رایگان (بدون هزینه)</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. WHY MALTOO: PRODUCT'S CORE VALUES */}
      {/* ========================================================================= */}
      <section id="why-maltoo" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
              ارزش‌های بنیادین
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-3">
              چرا مالتو متفاوت است؟
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              مالتو بازار نیست؛ بستری است برای گسترش سخاوت و پیوند میان همشهریان.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-start">
            {/* Value 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                  <Gift size={20} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">
                  ساده برای بخشیدن
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  دیگر نیازی به قیمت‌گذاری، مقایسه بازار یا پاسخ به ده‌ها پیام چانه‌زنی نیست. وسیله در چند ثانیه ثبت می‌شود و مستقیم به متقاضی واقعی می‌رسد.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] text-[#2563EB] font-semibold">
                ثبت بدون معطلی
              </div>
            </div>

            {/* Value 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">
                  نزدیک به آدم‌های اطراف
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  تمرکز مالتو بر شهر و محله شماست؛ تحویل با یک پیاده‌روی کوتاه در محله یا با پیک درون‌شهری انجام می‌شود و حس گرمای همسایگی زنده می‌ماند.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] text-emerald-700 font-semibold">
                پیوند محلی
              </div>
            </div>

            {/* Value 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">
                  ۱۰۰٪ رایگان و شفاف
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  هیچ کارمزد، هزینه اشتراک یا درگاه پرداختی در کار نیست. هر چیزی که در مالتو می‌بینید، اهدایی است و دریافت آن هزینه‌ای ندارد.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] text-indigo-700 font-semibold">
                بدون هزینه پنهان
              </div>
            </div>

            {/* Value 4 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">
                  بدون خرید و فروش
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  اینجا فروشگاه دست دوم نیست؛ کسی به دنبال سود مالی نیست. گفتگوها بر پایه احترام و همدلی شکل می‌گیرد نه معامله و سوداگری.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] text-amber-700 font-semibold">
                فضایی امن و آرام
              </div>
            </div>

            {/* Value 5 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Leaf size={20} />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">
                  استفاده دوباره از چیزهای مفید و کاهش مصرف‌گرایی
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  تولید هر کالا انرژی و منابع کره زمین را مصرف کرده است. با رساندن وسایل سالم به دست دیگران، از دور ریخته شدن آن‌ها جلوگیری می‌کنیم و چرخه مصرف پایدار را گسترش می‌دهیم.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[11px] text-teal-700 font-semibold">
                احترام به محیط زیست و منابع
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. EMOTIONAL / BRAND MOMENT: "دست به دست هم" */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#0E3058] text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-6 text-blue-200">
            <Heart size={24} className="fill-blue-200" />
          </div>

          <span className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-3 block">
            روح مالتو
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            دست به دست هم
          </h2>

          <p className="text-base sm:text-xl text-white/90 leading-relaxed font-light max-w-2xl mx-auto mb-10 text-balance">
            هر وسیله‌ای که گوشه خانه‌مان فراموش شده، می‌تواند آرزوی کوچک فردی در همین نزدیکی باشد. بخشیدن وسایل، ساده‌ترین راه برای ساختن جامعه‌ای مهربان‌تر است.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-white/80">
            <span>اینجا یک دیوار مهربانی بزرگ و دیجیتال است</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CTA: CONCRETE INVITATION INTO THE PRODUCT */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] mx-auto flex items-center justify-center mb-6 shadow-xs">
            <Sparkles size={28} />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight mb-4 text-balance">
            چیزی داری که دیگه لازم نداری؟
          </h2>

          <p className="text-base sm:text-xl text-[#475569] leading-relaxed mb-8 max-w-xl mx-auto">
            شاید یکی همین الان در نزدیکی تو منتظرشه.
            <br />
            همین امروز اولین هدیه را ثبت کن یا وسایل موجود را ببین.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onEnterApp()}
              endIcon={<ArrowLeft size={18} />}
              className="w-full sm:w-auto font-bold text-sm sm:text-base px-8 py-3.5 shadow-sm hover:shadow cursor-pointer"
            >
              ورود به مالتو و شروع
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => onEnterApp({ action: 'donate' })}
              startIcon={<Plus size={18} className="text-[#2563EB]" />}
              className="w-full sm:w-auto font-semibold text-sm sm:text-base px-6 py-3.5 cursor-pointer"
            >
              ثبت وسیله اهدایی جدید
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MINIMAL FOOTER: CLEAN, PROFESSIONAL & CONCISE */}
      {/* ========================================================================= */}
      <footer className="py-12 bg-[#F8FAFC] border-t border-[#E2E8F0] text-start">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-xs overflow-hidden">
                <img
                  src="/logo.png"
                  alt="مالتو"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.jpg';
                  }}
                />
              </div>
              <div>
                <span className="text-base font-black text-[#0F172A] block">مالتو</span>
                <span className="text-[11px] text-[#64748B]">سیستم جابه‌جایی و اهدای رایگان کالا</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-[#475569] font-medium">
              <button
                type="button"
                onClick={() => scrollToSection('the-idea')}
                className="hover:text-[#0F172A] cursor-pointer"
              >
                ایده مالتو
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#0F172A] cursor-pointer"
              >
                نحوه کارکرد
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('what-to-give')}
                className="hover:text-[#0F172A] cursor-pointer"
              >
                اقلام اهدایی
              </button>
              <button
                type="button"
                onClick={() => onEnterApp({ tab: 'explore' })}
                className="hover:text-[#0F172A] cursor-pointer"
              >
                کاوش همه هدایا
              </button>
              <button
                type="button"
                onClick={() => onEnterApp()}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                ورود به اپلیکیشن
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <p>
              تمامی فعالیت‌ها در مالتو بر پایه بخشش رایگان و بدون هیچ‌گونه دادوستد مالی است.
            </p>
            <div className="flex items-center gap-3">
              <span>نسخه بتا</span>
              {onNavigateToAdmin && (
                <button
                  type="button"
                  onClick={onNavigateToAdmin}
                  className="text-[#64748B] hover:text-[#0F172A] underline cursor-pointer"
                >
                  پنل مدیریت
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
