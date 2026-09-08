import React from 'react';
import { cn } from '../utils/cn.ts';
import { ConditionBadge } from './Badge.tsx';

export interface HeroCardData {
  id: string;
  title: string;
  description: string;
  condition: string;
  timeAgo: string;
  imageUrl: string;
  donorName?: string;
  city?: string;
}

export interface HeroCardProps {
  data: HeroCardData;
  onClick?: (id: string) => void;
  className?: string;
}

/**
 * Large Featured Item Card from the Figma design ("دوچرخه در حد"):
 * - Rounded 24px container
 * - Image with dark gradient scrim
 * - "سالم" condition badge at the top
 * - Title and natural Persian description overlaid at the bottom
 * - Timestamp ("دیروز") on the side
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  data,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={() => onClick?.(data.id)}
      className={cn(
        'group relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[24px] overflow-hidden cursor-pointer select-none',
        'border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* Background Image */}
      <img
        src={data.imageUrl}
        alt={data.title}
        loading="eager"
        className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
      />

      {/* Top Condition Badge with balanced margin from right edge */}
      <div className="absolute top-5 right-6 sm:top-6 sm:right-7 z-10">
        <ConditionBadge condition={data.condition} />
      </div>

      {/* Dark Scrim Overlay for crisp typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white text-start">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-1 mb-1 group-hover:text-blue-200 transition-colors">
              {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Time Ago on the side ("دیروز") */}
          <span className="text-xs text-white/70 whitespace-nowrap shrink-0 pb-0.5">
            {data.timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
};
