import React from 'react';
import { Modal } from './Modal.tsx';
import { ConditionBadge } from './Badge.tsx';
import { Button } from './Button.tsx';
import { MapPin, ShieldCheck, MessageCircle } from 'lucide-react';
import { DonationFeedItem } from './DonationFeedCard.tsx';
import { APP_CONFIG } from '../config/navigation.ts';

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
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      bodyClassName="p-0 flex flex-col"
      footer={
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
      }
    >
      {/* Top Banner Image with Condition Badge */}
      <div className="relative w-full aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-5 right-6 z-10">
          <ConditionBadge condition={item.condition} />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] mb-1.5">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#2563EB]" />
              {item.location || APP_CONFIG.defaultLocation}
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
            <strong>{APP_CONFIG.goldenRuleTitle}:</strong> {APP_CONFIG.goldenRuleDescription}
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
    </Modal>
  );
};

