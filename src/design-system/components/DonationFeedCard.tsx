import React from 'react';
import { cn } from '../utils/cn.ts';
import { ConditionBadge } from './Badge.tsx';

export interface DonationFeedItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  timeAgo: string;
  imageUrl: string;
  donorName?: string;
  location?: string;
  isDonated?: boolean;
}

export interface DonationFeedCardProps {
  item: DonationFeedItem;
  onClick?: (id: string) => void;
  className?: string;
}

/**
 * Signature Feed List Card directly matching the Figma design:
 * - Clean white card with rounded-2xl
 * - Right side (RTL start):
 *     Title (e.g. "لباس و سرهمی نوزادی")
 *     Description (e.g. "چند دست سرهمی و پاپوش کاملاً نو و سالم")
 *     Condition badge ("سالم")
 *     Time indicator ("دیروز")
 * - Left side (RTL end):
 *     Rounded square thumbnail photo of the item
 */
export const DonationFeedCard: React.FC<DonationFeedCardProps> = ({
  item,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={() => onClick?.(item.id)}
      className={cn(
        'group bg-white rounded-2xl p-3.5 border border-[#E2E8F0] hover:border-[#CBD5E1]',
        'shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-sm transition-all duration-150',
        'flex items-center justify-between gap-3 text-start cursor-pointer select-none',
        className
      )}
    >
      {/* Text Info Section (RTL Start) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors mb-1">
            {item.title}
          </h3>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-2.5">
            {item.description}
          </p>
        </div>

        {/* Bottom row: Condition badge + Time ago */}
        <div className="flex items-center gap-3">
          <ConditionBadge condition={item.condition} />
          <span className="text-[11px] text-[#94A3B8]">{item.timeAgo}</span>
          {item.location && (
            <span className="text-[11px] text-[#94A3B8] hidden sm:inline-block">
              • {item.location}
            </span>
          )}
        </div>
      </div>

      {/* Image Thumbnail (RTL End) */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F1F5F9] overflow-hidden shrink-0 border border-[#E2E8F0]/80">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {item.isDonated && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] text-white font-bold bg-[#16A34A] px-1.5 py-0.5 rounded">
              اهدا شد
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
