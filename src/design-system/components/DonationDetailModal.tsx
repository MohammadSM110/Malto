import React from 'react';
import { cn } from '../utils/cn.ts';
import { ConditionBadge } from './Badge.tsx';
import { Button } from './Button.tsx';
import { X, MapPin, ShieldCheck, MessageCircle } from 'lucide-react';
import { DonationFeedItem } from './DonationFeedCard.tsx';

export interface DonationDetailModalProps {
  item: DonationFeedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestDonation?: (item: DonationFeedItem) => void;
}

export const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onRequestDonation,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div
        className={cn(
          'bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0]',
          'flex flex-col max-h-[90vh] text-start animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Modal Top Header with Close */}
        <div className="relative w-full aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 inset-inline-end-3.5 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
          <div className="absolute top-3.5 inset-inline-start-3.5">
            <ConditionBadge condition={item.condition} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] mb-1.5">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#2563EB]" />
                {item.location || 'تهران / شهرک غرب'}
              </span>
              <span>ثبت شده: {item.timeAgo}</span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] leading-snug">
              {item.title}
            </h2>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs leading-relaxed text-[#334155]">
            <p className="font-medium text-[#0F172A] mb-1">درباره این هدیه:</p>
            {item.description}
          </div>

          {/* Free Donation Guarantee Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] text-xs text-[#1D4ED8]">
            <ShieldCheck size={18} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>قانون طلایی مالتو:</strong> این کالا کاملاً رایگان است. دریافت هرگونه هزینه برای واگذاری خلاف قوانین مالتو است.
            </div>
          </div>

          {/* Donor Info Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569] font-bold text-sm">
                م
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block">
                  {item.donorName || 'اهداکننده مالتو'}
                </span>
                <span className="text-[11px] text-[#64748B]">کاربر باسابقه در مالتو</span>
              </div>
            </div>
            <span className="text-xs text-[#16A34A] font-medium bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              کاربر تأییدشده
            </span>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              onRequestDonation?.(item);
              onClose();
            }}
            startIcon={<MessageCircle size={16} />}
          >
            درخواست دریافت این کالا
          </Button>
        </div>
      </div>
    </div>
  );
};
