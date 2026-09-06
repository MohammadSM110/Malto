import React, { useState } from 'react';
import { cn } from '../design-system/utils/cn.ts';
import { toPersianDigits } from '../design-system/utils/persian.ts';
import { Button } from '../design-system/components/Button.tsx';
import { ConditionBadge, CategoryPill, Badge } from '../design-system/components/Badge.tsx';
import { Skeleton, ErrorState } from '../design-system/components/Feedback.tsx';
import { ExploreItem, EXPLORE_ITEMS } from '../data/exploreData.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { createItemRequest, incrementItemViews } from '../lib/firestoreService.ts';
import {
  ArrowRight,
  Heart,
  Share2,
  Flag,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Sparkles,
  Truck,
  Building2,
  Calendar,
  Award,
  AlertTriangle,
  X,
  Copy,
  Send,
  Info,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';

export interface ItemDetailPageProps {
  item: ExploreItem;
  onBack: () => void;
  onSelectRelatedItem?: (item: ExploreItem) => void;
  onRequestSubmitted?: (item: ExploreItem, message: string) => void;
  className?: string;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  onBack,
  onSelectRelatedItem,
  onRequestSubmitted,
  className,
}) => {
  // Authentication
  const { currentUser, userProfile, isAuthenticated, requireAuth } = useAuth();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState(
    `سلام ${item.donorName} عزیز، من به این هدیه نیاز دارم و شرایط دریافت آن را دارم. در صورت تمایل می‌توانم جهت تحویل هماهنگ کنم.`
  );
  const [pickupOption, setPickupOption] = useState<'pickup' | 'courier' | 'any'>('pickup');
  const [agreedToFreeTerms, setAgreedToFreeTerms] = useState(true);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Increment item views on first render
  React.useEffect(() => {
    if (item.id) {
      incrementItemViews(item.id);
    }
  }, [item.id]);

  // Dev state simulation
  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [simulatedError, setSimulatedError] = useState(false);

  // Protected claim initiation
  const handleInitiateClaim = () => {
    requireAuth({
      title: 'ورود به حساب برای درخواست این هدیه',
      description: `برای ارسال پیام به اهداکننده «${item.title}» و ثبت درخواست، لطفاً وارد حساب خود شوید.`,
      actionType: 'request_item',
      onAuthenticated: () => {
        setIsClaimModalOpen(true);
      },
    });
  };

  const handleBookmarkToggle = () => {
    requireAuth({
      title: 'ورود برای نشان‌کردن هدیه',
      description: 'برای ذخیره و مدیریت این هدیه در لیست نشان‌شده‌های شخصی، لطفاً وارد شوید.',
      actionType: 'manage_content',
      onAuthenticated: () => {
        setIsBookmarked((prev) => !prev);
        showToast(!isBookmarked ? 'هدیه به نشان‌شده‌ها افزوده شد' : 'هدیه از نشان‌شده‌ها حذف شد');
      },
    });
  };

  // Gallery images (fallback to single image if array not provided)
  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];

  // Related items from same category
  const relatedItems = EXPLORE_ITEMS.filter(
    (other) => other.id !== item.id && (other.category === item.category || other.district === item.district)
  ).slice(0, 3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showToast(
      !isBookmarked
        ? 'به لیست نشان‌شده‌های شما افزوده شد'
        : 'از لیست نشان‌شده‌ها حذف شد'
    );
  };

  const handleCopyShareLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast('لینک هدیه در حافظه کپی شد');
    setIsShareModalOpen(false);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToFreeTerms) return;

    if (!isAuthenticated) {
      handleInitiateClaim();
      return;
    }

    const requesterId = userProfile?.uid || currentUser?.uid;
    if (!requesterId) {
      handleInitiateClaim();
      return;
    }
    const requesterName = userProfile?.displayName || currentUser?.displayName || 'کاربر متقاضی مالتو';

    setIsSubmittingClaim(true);
    try {
      await createItemRequest({
        itemId: item.id,
        itemTitle: item.title,
        itemImageUrl: item.imageUrl,
        requesterId,
        requesterName,
        donorId: (item as any).donorId || 'donor_community',
        donorName: item.donorName,
        message: claimMessage.trim(),
        pickupOption,
      });

      setIsSubmittingClaim(false);
      setClaimSuccess(true);
      onRequestSubmitted?.(item, claimMessage);
      showToast(`درخواست شما برای «${item.title}» در پایگاه مالتو ثبت شد.`);
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimSuccess(false);
      }, 1500);
    } catch (err: any) {
      setIsSubmittingClaim(false);
      showToast('خطا در ثبت درخواست در پایگاه داده مالتو.');
    }
  };

  // Loading State View
  if (simulatedLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 animate-pulse select-none text-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-48 h-5 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulatedLoading(false)}
              className="text-xs"
            >
              خروج از حالت لودینگ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Skeleton className="w-full h-80 rounded-3xl" />
            <div className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-full h-8 rounded-xl" />
            <Skeleton className="w-3/4 h-5 rounded-lg" />
            <Skeleton className="w-full h-32 rounded-3xl mt-4" />
            <Skeleton className="w-full h-12 rounded-2xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // Error State View
  if (simulatedError) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16">
        <ErrorState
          title="خطا در دریافت اطلاعات هدیه"
          description="ارتباط با سرور برقرار نشد یا این هدیه قبلاً توسط کاربر دیگری دریافت شده است."
          onRetry={() => setSimulatedError(false)}
        />
        <div className="text-center mt-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            بازگشت به فهرست
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 text-start select-none', className)}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 inset-inline-end-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-[#0F172A] text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm border border-slate-700">
            <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
            <span className="leading-relaxed">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Bar: Back button, Breadcrumbs & Developer State Simulators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-all shadow-xs cursor-pointer group"
          >
            <ArrowRight size={16} className="text-[#64748B] group-hover:-translate-x-0.5 transition-transform" />
            <span>بازگشت به فهرست</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#94A3B8] pe-2">
            <span>/</span>
            <span>هدایای رایگان</span>
            <span>/</span>
            <span className="text-[#64748B] font-medium">{item.categoryLabel}</span>
          </div>
        </div>

        {/* Secondary Actions & Dev simulation controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={cn(
              'p-2 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-medium',
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            )}
            title="نشان کردن این هدیه"
          >
            <Heart size={16} className={cn(isBookmarked && 'fill-rose-500 text-rose-500')} />
            <span className="hidden md:inline">{isBookmarked ? 'نشان‌شده' : 'نشان کردن'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-medium"
            title="اشتراک‌گذاری هدیه"
          >
            <Share2 size={16} />
            <span className="hidden md:inline">اشتراک</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#94A3B8] hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
            title="گزارش آگهی غیررایگان یا نامناسب"
          >
            <Flag size={15} />
          </button>

          {/* Dev State Simulators */}
          <div className="hidden lg:flex items-center gap-1 border-s border-[#E2E8F0] ps-2">
            <button
              type="button"
              onClick={() => setSimulatedLoading(true)}
              className="px-2 py-1 text-[10px] text-[#64748B] hover:text-[#2563EB] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              title="مشاهده حالت در حال بارگذاری"
            >
              تست لودینگ
            </button>
            <button
              type="button"
              onClick={() => setSimulatedError(true)}
              className="px-2 py-1 text-[10px] text-[#64748B] hover:text-rose-600 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              title="مشاهده حالت خطا"
            >
              تست خطا
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Two Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* COLUMN 1: IMAGE GALLERY & VISUAL HIGHLIGHTS (lg: 7 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Display Image */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-[#E2E8F0] shadow-sm group">
            <img
              src={images[selectedImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlaid Badges */}
            <div className="absolute top-4 inset-inline-start-4 flex flex-col gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/95 backdrop-blur-md text-white text-xs font-bold shadow-md">
                <Gift size={13} />
                <span>اهدای ۱۰۰٪ رایگان</span>
              </span>

              {item.urgentPickup && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/95 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                  <Clock size={12} />
                  <span>تحویل فوری امروز</span>
                </span>
              )}
            </div>

            {/* Bottom Floating Stats on Image */}
            <div className="absolute bottom-4 inset-inline-start-4 inset-inline-end-4 flex items-center justify-between text-white text-xs bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl pointer-events-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  <span>{item.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  <span>{item.timeAgo}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 font-num">
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  <span>{toPersianDigits(item.viewsCount)} بازدید</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <Sparkles size={13} />
                  <span>{toPersianDigits(item.requestsCount)} متقاضی</span>
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip (if multiple images) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    'relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer',
                    selectedImageIndex === idx
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 scale-105 shadow-sm'
                      : 'border-[#E2E8F0] opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={img} alt={`تصویر ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Golden Rule Protection Banner */}
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 text-start">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Gift size={18} />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-[#1E40AF] text-sm mb-0.5">
                قانون طلایی مالتو: بدون قیمت، بدون خرید و فروش
              </h4>
              <p className="text-[#3B82F6] leading-relaxed">
                این کالا به عنوان هدیه رایگان ثبت شده است. هرگونه مطالبه وجه، شیرینی، یا هزینه کالا خلاف قوانین مالتو است. در صورت مشاهده لطفاً گزارش دهید.
              </p>
            </div>
          </div>

          {/* Specifications & Attributes */}
          {item.specs && item.specs.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Building2 size={16} className="text-[#2563EB]" />
                <span>مشخصات و جزئیات کالا</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {item.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs">
                    <span className="text-[#64748B] font-medium mb-1">{spec.label}</span>
                    <span className="text-[#0F172A] font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: DETAILS, OWNER INFO & CLAIM ACTION (lg: 5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Header & Badges */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                {item.categoryLabel}
              </span>
              <ConditionBadge condition={item.condition} />
              <span className="px-2.5 py-0.5 text-xs text-[#64748B] bg-slate-100 rounded-full font-num">
                کد هدیه: #{item.id.replace('exp-', '')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
              {item.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-[#94A3B8]" />
                <span>{item.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-[#94A3B8]" />
                <span>ثبت شده {item.timeAgo}</span>
              </span>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#0F172A]">توضیحات اهداکننده</h3>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Delivery & Pickup Information */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Truck size={17} />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">شیوه تحویل هدیه</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {item.deliveryLabel}
                </span>
              </div>
              <p className="text-[#64748B] mt-1">
                {item.pickupAddress || `تحویل در محدوده ${item.district} با هماهنگی در پیام‌ها`}
              </p>
            </div>
          </div>

          {/* Owner / Donor Profile Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                اطلاعات اهداکننده کالا
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                <ShieldCheck size={13} />
                <span>هویت تاییدشده</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {item.donorName.slice(0, 1)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#0F172A]">{item.donorName}</h4>
                  {item.donorBadge && (
                    <span className="text-[10px] text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-medium border border-[#BFDBFE]">
                      {item.donorBadge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#64748B] mt-0.5">
                  {item.donorJoined || 'عضو باسابقه جامعه مالتو'}
                </span>
              </div>
            </div>

            {/* Donor Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9] text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-2">
                <Award size={16} className="text-[#2563EB] shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#0F172A] font-num">
                    {toPersianDigits(item.donorDonatedCount || 3)} هدیه
                  </span>
                  <span className="text-[10px] text-[#64748B]">اهدای موفق در مالتو</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-center gap-2">
                <Clock size={16} className="text-emerald-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#0F172A]">
                    {item.donorResponseTime || 'پاسخگویی سریع'}
                  </span>
                  <span className="text-[10px] text-[#64748B]">سرعت پاسخ به پیام‌ها</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRIMARY ACTION: REQUEST / CLAIM THIS FREE ITEM */}
          {/* ========================================================================= */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-[#BFDBFE] shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Gift size={15} className="text-[#2563EB]" />
                <span>هدیه ۱۰۰٪ رایگان</span>
              </span>
              <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-medium">
                بدون نیاز به کارت بانکی یا وجه
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleInitiateClaim}
              className="w-full text-sm font-bold shadow-md h-12 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              <span>درخواست دریافت این هدیه (رایگان)</span>
            </Button>

            <p className="text-[11px] text-[#64748B] text-center">
              با ثبت درخواست، پیام شما مستقیماً برای اهداکننده ارسال و گفتگو آغاز می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RELATED FREE DONATIONS SECTION */}
      {/* ========================================================================= */}
      {relatedItems.length > 0 && (
        <section className="pt-8 border-t border-[#E2E8F0] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                سایر هدایای مشابه در دسته {item.categoryLabel}
              </h3>
            </div>
            <span className="text-xs text-[#64748B]">همگی ۱۰۰٪ رایگان</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedItems.map((related) => (
              <div
                key={related.id}
                onClick={() => onSelectRelatedItem?.(related)}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-3 hover:border-[#2563EB]/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 group"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={related.imageUrl}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 inset-inline-start-2">
                    <ConditionBadge condition={related.condition} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                    {related.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5">
                    <span>{related.district}</span>
                    <span>{related.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CLAIM / REQUEST ITEM DIALOG */}
      {/* ========================================================================= */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Gift size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">درخواست دریافت هدیه رایگان</h3>
                  <p className="text-[11px] text-[#64748B]">{item.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitClaim} className="p-5 flex flex-col gap-4 overflow-y-auto">
              {claimSuccess ? (
                <div className="py-8 flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-bold text-[#0F172A]">درخواست شما ثبت شد!</h4>
                  <p className="text-xs text-[#64748B] max-w-sm">
                    پیام شما به {item.donorName} ارسال گردید. به محض پاسخ اهداکننده، هماهنگی تحویل در تب پیام‌ها انجام خواهد شد.
                  </p>
                </div>
              ) : (
                <>
                  {/* Item preview snippet */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-[#0F172A] line-clamp-1">{item.title}</span>
                      <span className="text-[#64748B] mt-0.5">اهداکننده: {item.donorName} ({item.district})</span>
                      <span className="text-[#2563EB] font-medium mt-0.5">اهدای ۱۰۰٪ رایگان</span>
                    </div>
                  </div>

                  {/* Requester Identity Confirmation */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs">
                    <span className="text-[#1E40AF] font-medium">ارسال درخواست با حساب:</span>
                    <span className="font-bold text-[#1D4ED8]">
                      {userProfile?.displayName || currentUser?.displayName || 'کاربر مالتو'}
                    </span>
                  </div>

                  {/* Message to Donor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      پیام مودبانه شما به اهداکننده:
                    </label>
                    <textarea
                      rows={3}
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none leading-relaxed text-[#0F172A]"
                      placeholder="دلیل نیاز خود یا نحوه تحویل را توضیح دهید..."
                      required
                    />
                  </div>

                  {/* Pickup Preference Option */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#0F172A]">
                      ترجیح شما برای هماهنگی تحویل:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPickupOption('pickup')}
                        className={cn(
                          'p-2.5 rounded-xl border text-start transition-all cursor-pointer',
                          pickupOption === 'pickup'
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold'
                            : 'bg-white border-[#E2E8F0] text-[#64748B]'
                        )}
                      >
                        تحویل حضوری در {item.district}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickupOption('courier')}
                        className={cn(
                          'p-2.5 rounded-xl border text-start transition-all cursor-pointer',
                          pickupOption === 'courier'
                            ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-bold'
                            : 'bg-white border-[#E2E8F0] text-[#64748B]'
                        )}
                      >
                        ارسال با پیک (کرایه با گیرنده)
                      </button>
                    </div>
                  </div>

                  {/* Terms & Golden Rule Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToFreeTerms}
                      onChange={(e) => setAgreedToFreeTerms(e.target.checked)}
                      className="mt-0.5 accent-[#2563EB]"
                    />
                    <span className="text-[11px] text-[#1E40AF] leading-relaxed font-medium">
                      تایید می‌کنم که مالتو پلتفرم بخشش کالا است، این هدیه رایگان بوده و هیچ‌گونه وجهی بابت خود کالا رد و بدل نمی‌شود.
                    </span>
                  </label>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsClaimModalOpen(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!agreedToFreeTerms || isSubmittingClaim}
                      startIcon={<Send size={15} />}
                    >
                      {isSubmittingClaim ? 'در حال ارسال...' : 'ارسال درخواست دریافت'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SHARE MODAL */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">اشتراک‌گذاری هدیه</h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#64748B]">
              این هدیه رایگان را با دوستان یا افراد نیازمند به اشتراک بگذارید:
            </p>
            <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between gap-2">
              <span className="text-xs text-[#64748B] truncate font-mono">
                maalto.app/gift/{item.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyShareLink}
                startIcon={<Copy size={14} />}
                className="shrink-0 text-xs h-8"
              >
                کپی لینک
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPORT MODAL */}
      {/* ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={18} />
                <h3 className="text-sm font-bold">گزارش تخلف یا درخواست وجه</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              مالتو ۱۰۰٪ رایگان است. چنانچه اهداکننده از شما تقاضای پول، بیعانه یا شیرینی کرد، یا کالا غیرواقعی بود، گزارش دهید:
            </p>
            <div className="flex flex-col gap-2 text-xs">
              {[
                'اهداکننده تقاضای وجه یا بیعانه کرده است',
                'کالا فروخته شده یا دیگر موجود نیست',
                'تصاویر یا اطلاعات غیرواقعی است',
                'کالای غیرمجاز یا نامناسب',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    showToast('گزارش شما برای تیم نظارت مالتو ارسال شد.');
                    setIsReportModalOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-rose-300 hover:bg-rose-50 text-start text-[#334155] hover:text-rose-700 transition-all cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
