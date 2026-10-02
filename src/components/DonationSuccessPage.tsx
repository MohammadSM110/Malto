import React, { useState } from 'react';
import { ExploreItem } from '../data/exploreData.ts';
import { Button } from '../design-system/components/Button.tsx';
import { ConditionBadge } from '../design-system/components/Badge.tsx';
import { toPersianDigits } from '../design-system/utils/persian.ts';
import {
  Gift,
  CheckCircle2,
  Sparkles,
  MapPin,
  Eye,
  Plus,
  ArrowRight,
  ArrowLeft,
  User,
  Copy,
  Check,
  Share2,
  HeartHandshake,
  Clock,
  ShieldCheck,
  Layers,
  Truck,
} from 'lucide-react';

export interface DonationSuccessPageProps {
  item: ExploreItem;
  onGoToProfile: () => void;
  onViewItemDetail: (item: ExploreItem) => void;
  onAddAnother: () => void;
  onGoToExplore: () => void;
}

export const DonationSuccessPage: React.FC<DonationSuccessPageProps> = ({
  item,
  onGoToProfile,
  onViewItemDetail,
  onAddAnother,
  onGoToExplore,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shortCode = item.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'MLT890';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shortCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }).catch(() => {});
  };

  const handleCopyShare = () => {
    const shareText = `هدیه رایگان «${item.title}» در مالتو منتشر شد!`;
    navigator.clipboard?.writeText(`${shareText}\n${window.location.origin}`).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {});
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in zoom-in-95 duration-300 select-none text-start">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl flex flex-col items-center text-center">
        {/* Animated Celebration Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center shadow-md border border-emerald-200">
            <Gift size={44} className="animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* 100% Free Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold mb-3 border border-[#BFDBFE]">
          <Sparkles size={14} className="text-[#2563EB]" />
          <span>اهدای ۱۰۰٪ رایگان در شبکه مالتو ثبت شد</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0F172A] mb-2 tracking-tight">
          کالای شما با موفقیت ثبت و منتشر شد!
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B] max-w-md leading-relaxed mb-6">
          از سخاوت و همراهی شما در چرخه بخشش کالا سپاسگزاریم. این هدیه هم‌اکنون در فید کاوش مالتو قرار گرفته و در بخش «کالاهای اهدایی من» در پروفایل شما ثبت گردید.
        </p>

        {/* Detailed Item Confirmation Card */}
        <div className="w-full bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] text-start mb-6">
          <div className="flex items-start gap-3.5 pb-4 border-b border-[#E2E8F0]">
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#E2E8F0] shrink-0 shadow-xs"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                    {item.categoryLabel || item.category || 'کالای رایگان'}
                  </span>
                  <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-md border border-[#BBF7D0]">
                    ۱۰۰٪ رایگان
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] truncate">
                  {item.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] mt-2">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-[#94A3B8]" />
                  <span>{item.location}</span>
                </span>
                <span>•</span>
                <span className="text-[#334155] font-medium">
                  {item.condition}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Meta Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] flex flex-col">
              <span className="text-[10px] text-[#94A3B8]">کد رهگیری آگهی:</span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="font-mono font-bold text-[#0F172A] text-xs font-num">
                  #{shortCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-[#64748B] hover:text-[#2563EB] p-0.5 rounded cursor-pointer transition-colors"
                  title="کپی کد"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F0] flex flex-col">
              <span className="text-[10px] text-[#94A3B8]">وضعیت انتشار:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-emerald-700 text-xs">فعال در کاوش</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white p-2.5 rounded-xl border border-[#E2E8F0] flex flex-col">
              <span className="text-[10px] text-[#94A3B8]">شیوه تحویل:</span>
              <span className="font-medium text-[#0F172A] text-xs truncate mt-0.5">
                {item.deliveryLabel || 'تحویل حضوری رایگان'}
              </span>
            </div>
          </div>
        </div>

        {/* Community Generosity Note */}
        <div className="w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3.5 text-xs text-[#1D4ED8] flex items-start gap-2.5 text-start mb-6">
          <HeartHandshake size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">مرحله بعدی چیست؟ </span>
            <span>
              متقاضیان می‌توانند با ارسال درخواست در مالتو هدیه شما را تقاضا کنند. شما در بخش اعلان‌ها و پروفایل می‌توانید پیام‌ها را مشاهده و هدیه‌گیرنده را انتخاب فرمایید.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            variant="primary"
            className="flex-1 text-xs sm:text-sm h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold shadow-md"
            onClick={onGoToProfile}
            startIcon={<User size={18} />}
          >
            مشاهده در پروفایل من (کالاهای اهدایی)
          </Button>

          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm h-12 border-[#CBD5E1] text-[#0F172A] font-medium hover:bg-[#F8FAFC]"
            onClick={() => onViewItemDetail(item)}
            startIcon={<Eye size={18} />}
          >
            مشاهده صفحه جزئیات آگهی
          </Button>
        </div>

        <div className="w-full flex items-center justify-center gap-4 text-xs pt-2 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onAddAnother}
            className="text-[#2563EB] hover:underline font-medium inline-flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Plus size={15} />
            <span>ثبت یک هدیه دیگر</span>
          </button>

          <span className="text-[#CBD5E1]">•</span>

          <button
            type="button"
            onClick={handleCopyShare}
            className="text-[#64748B] hover:text-[#0F172A] font-medium inline-flex items-center gap-1.5 cursor-pointer py-1"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600">لینک کپی شد</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>اشتراک‌گذاری</span>
              </>
            )}
          </button>

          <span className="text-[#CBD5E1]">•</span>

          <button
            type="button"
            onClick={onGoToExplore}
            className="text-[#64748B] hover:text-[#0F172A] font-medium inline-flex items-center gap-1 cursor-pointer py-1"
          >
            <span>بازگشت به صفحه کاوش</span>
            <ArrowLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
