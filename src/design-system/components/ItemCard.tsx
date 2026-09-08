import React from 'react';
import { cn } from '../utils/cn.ts';
import { ConditionBadge } from './Badge.tsx';
import { MapPin, Zap } from 'lucide-react';

export interface BaseItemData {
  id: string;
  title: string;
  description: string;
  condition: string;
  timeAgo: string;
  imageUrl: string;
  location?: string;
  donorName?: string;
  categoryLabel?: string;
  urgentPickup?: boolean;
  isDonated?: boolean;
  requestsCount?: number;
}

export type ItemCardVariant = 'feed' | 'grid' | 'list';

export interface ItemCardProps<T extends BaseItemData = BaseItemData> {
  item: T;
  variant?: ItemCardVariant;
  onClick?: (item: T) => void;
  className?: string;
}

/**
 * Unified ItemCard component providing:
 * - 'feed': The signature horizontal feed card directly matching the Figma design screenshot ("لباس و سرهمی نوزادی")
 * - 'grid': High-impact card for explore grid views with top badges and 100% free ribbon
 * - 'list': Expanded horizontal card with category badges and full metadata
 */
export const ItemCard = <T extends BaseItemData = BaseItemData>({
  item,
  variant = 'feed',
  onClick,
  className,
}: ItemCardProps<T>) => {
  // 1. Signature Figma Feed List Card
  if (variant === 'feed') {
    return (
      <div
        onClick={() => onClick?.(item)}
        className={cn(
          'group bg-white rounded-2xl p-3.5 border border-[#E2E8F0] hover:border-[#CBD5E1]',
          'shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-sm transition-all duration-150',
          'flex items-center justify-between gap-3 text-start cursor-pointer select-none',
          className
        )}
      >
        {/* Text Info (RTL start) */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-2.5">
              {item.description}
            </p>
          </div>

          {/* Meta row: Condition badge + Time ago */}
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

        {/* Thumbnail Photo (RTL end) */}
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
  }

  // 2. Expanded List Card
  if (variant === 'list') {
    return (
      <div
        onClick={() => onClick?.(item)}
        className={cn(
          'group bg-white rounded-2xl p-3.5 border border-[#E2E8F0] hover:border-[#CBD5E1]',
          'shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-sm transition-all duration-150',
          'flex items-center justify-between gap-3 text-start cursor-pointer select-none',
          className
        )}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {item.categoryLabel && (
                <span className="text-[11px] text-[#2563EB] font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                  {item.categoryLabel}
                </span>
              )}
              {item.urgentPickup && (
                <span className="text-[10px] text-[#DC2626] font-medium bg-[#FEE2E2] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Zap size={11} />
                  <span>تحویل فوری</span>
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-2">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <ConditionBadge condition={item.condition} />
              <span className="text-[11px] text-[#94A3B8]">{item.timeAgo}</span>
            </div>
            {item.location && (
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <MapPin size={12} className="text-[#94A3B8]" />
                {item.location}
              </span>
            )}
          </div>
        </div>

        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F1F5F9] overflow-hidden shrink-0 border border-[#E2E8F0]/80">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    );
  }

  // 3. Grid Card
  return (
    <div
      onClick={() => onClick?.(item)}
      className={cn(
        'group bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] hover:border-[#CBD5E1]',
        'shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200',
        'flex flex-col text-start cursor-pointer select-none',
        className
      )}
    >
      <div className="relative w-full aspect-[4/3] bg-[#F1F5F9] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <ConditionBadge condition={item.condition} />
          {item.urgentPickup ? (
            <span className="text-[10px] font-bold text-white bg-[#DC2626] px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
              <Zap size={11} />
              <span>فوری</span>
            </span>
          ) : item.categoryLabel ? (
            <span className="text-[10px] font-semibold text-white bg-[#0F172A]/70 backdrop-blur-xs px-2 py-0.5 rounded-lg">
              {item.categoryLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB] transition-colors mb-1.5">
            {item.title}
          </h3>
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        <div className="pt-2.5 border-t border-[#F1F5F9] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={12} className="text-[#94A3B8] shrink-0" />
              {item.location || 'تهران'}
            </span>
            <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">
              {item.timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
