import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn.ts';
import { ConditionBadge } from './Badge.tsx';
import { toPersianDigits } from '../utils/persian.ts';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Flame,
  Layers,
} from 'lucide-react';

export interface HeroCardStackItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  timeAgo: string;
  imageUrl: string;
  city?: string;
  location?: string;
  district?: string;
  viewsCount?: number;
  requestsCount?: number;
  donorName?: string;
}

export interface HeroCardStackProps {
  items: HeroCardStackItem[];
  onSelectItem?: (item: HeroCardStackItem) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Swipeable Card Stack for Home page featured section:
 * - Connected directly to Explore feed popularity ranking (most-viewed items from all cities)
 * - Tactile 3D card stack with layered offset cards behind the main card
 * - Touch & pointer drag swiping with momentum tilt and smooth dismiss
 * - Clickable navigation chevrons and pagination indicator dots
 * - RTL-first design with Persian typography and Figma visual aesthetics
 */
export const HeroCardStack: React.FC<HeroCardStackProps> = ({
  items,
  onSelectItem,
  className,
  title = 'محبوب‌ترین‌های کاوش',
  subtitle = 'همه شهرها',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissDirection, setDismissDirection] = useState<'left' | 'right' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  // Clamp current index if items list changes
  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (items.length <= 1 || isDismissing) return;
    setIsDismissing(true);
    setDismissDirection('left');
    setDragOffset({ x: -420, y: 0 });

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setDragOffset({ x: 0, y: 0 });
      setIsDismissing(false);
      setDismissDirection(null);
    }, 240);
  }, [items.length, isDismissing]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1 || isDismissing) return;
    setIsDismissing(true);
    setDismissDirection('right');
    setDragOffset({ x: 420, y: 0 });

    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setDragOffset({ x: 0, y: 0 });
      setIsDismissing(false);
      setDismissDirection(null);
    }, 240);
  }, [items.length, isDismissing]);

  // Pointer / Touch Gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDismissing || items.length <= 1) return;
    // Only primary mouse button or touch
    if (e.button !== 0) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    isHorizontalSwipeRef.current = null;
    setIsDragging(true);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isDismissing) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Initial direction lock
    if (isHorizontalSwipeRef.current === null && (absX > 6 || absY > 6)) {
      if (absY > absX * 1.3) {
        // Vertical scroll dominant: don't capture horizontal swipe
        isHorizontalSwipeRef.current = false;
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        return;
      } else {
        isHorizontalSwipeRef.current = true;
      }
    }

    if (isHorizontalSwipeRef.current) {
      hasMovedRef.current = true;
      // Damped horizontal movement with slight vertical drag
      setDragOffset({
        x: dx,
        y: dy * 0.15,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const dx = dragOffset.x;
    const absDx = Math.abs(dx);

    // If movement was minimal (< 8px), treat as tap/click
    if (!hasMovedRef.current || absDx < 8) {
      setDragOffset({ x: 0, y: 0 });
      if (items[currentIndex]) {
        onSelectItem?.(items[currentIndex]);
      }
      return;
    }

    // Swipe threshold to dismiss and advance card
    const SWIPE_THRESHOLD = 65;

    if (absDx > SWIPE_THRESHOLD) {
      setIsDismissing(true);
      const isLeft = dx < 0;
      setDismissDirection(isLeft ? 'left' : 'right');
      setDragOffset({ x: isLeft ? -450 : 450, y: 0 });

      setTimeout(() => {
        if (isLeft) {
          // Swiped left -> advance to next card
          setCurrentIndex((prev) => (prev + 1) % items.length);
        } else {
          // Swiped right -> go to previous card
          setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        }
        setDragOffset({ x: 0, y: 0 });
        setIsDismissing(false);
        setDismissDirection(null);
      }, 230);
    } else {
      // Snap back to resting position
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    isHorizontalSwipeRef.current = null;
  };

  if (!items || items.length === 0) {
    // Skeleton placeholder with layered cards behind
    return (
      <div className={cn('relative w-full select-none text-start', className)}>
        <div className="flex items-center justify-between mb-2.5 px-1 w-full min-h-[28px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563EB]" />
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A]">{title}</h2>
          </div>
        </div>
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[220px] rounded-[24px] bg-slate-900 animate-pulse border border-[#E2E8F0]" />
      </div>
    );
  }

  const activeItem = items[currentIndex];
  // Calculate up to 2 cards behind for layered stack depth
  const nextItem1 = items.length > 1 ? items[(currentIndex + 1) % items.length] : null;
  const nextItem2 = items.length > 2 ? items[(currentIndex + 2) % items.length] : null;

  // Real-time gesture progress (0 to 1) for physics-based dynamic interpolation
  const dragProgress = Math.min(Math.abs(dragOffset.x) / 140, 1);

  return (
    <div className={cn('relative w-full select-none text-start overflow-visible', className)}>
      {/* Header bar: Title, Explore context pill, and card counter */}
      <div className="flex items-center justify-between mb-2.5 px-1 w-full min-h-[28px]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563EB]" />
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <span>{title}</span>
            <Flame size={14} className="text-[#EA580C] shrink-0 fill-[#EA580C]" />
          </h2>
          <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-medium border border-[#DBEAFE]">
            {subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span className="font-num font-bold text-[#2563EB]">
            {toPersianDigits(currentIndex + 1)}
          </span>
          <span className="text-[#94A3B8]">/</span>
          <span className="font-num text-[#64748B]">
            {toPersianDigits(items.length)}
          </span>
        </div>
      </div>

      {/* Stack container: accommodates layered cards offset with padding bottom */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[220px] sm:min-h-[260px] pb-5 touch-pan-y overflow-visible"
      >
        {/* Layer 2: Third card behind (smallest, lowest opacity, offset further down) */}
        {nextItem2 && (
          <div
            className="absolute inset-x-0 top-0 w-full h-[calc(100%-20px)] rounded-[24px] overflow-hidden bg-slate-900 border border-slate-200/90 shadow-xs pointer-events-none transition-all duration-300"
            style={{
              zIndex: 10,
              transform: `translate3d(0, ${20 - 10 * dragProgress}px, 0) scale(${
                0.88 + 0.06 * dragProgress
              })`,
              opacity: 0.65 + 0.2 * dragProgress,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={nextItem2.imageUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = '1';
                  target.src = '/images/items/default-item.jpg';
                } else {
                  target.src = './images/items/default-item.jpg';
                }
              }}
              className="w-full h-full object-cover object-center brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          </div>
        )}

        {/* Layer 1: Second card behind (middle layer, medium scale & offset) */}
        {nextItem1 && (
          <div
            className="absolute inset-x-0 top-0 w-full h-[calc(100%-20px)] rounded-[24px] overflow-hidden bg-slate-900 border border-slate-200/90 shadow-sm pointer-events-none transition-all duration-300"
            style={{
              zIndex: 20,
              transform: `translate3d(0, ${10 - 10 * dragProgress}px, 0) scale(${
                0.94 + 0.06 * dragProgress
              })`,
              opacity: 0.85 + 0.15 * dragProgress,
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={nextItem1.imageUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = '1';
                  target.src = '/images/items/default-item.jpg';
                } else {
                  target.src = './images/items/default-item.jpg';
                }
              }}
              className="w-full h-full object-cover object-center brightness-[0.9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            {/* Condition preview badge on card behind */}
            <div className="absolute top-4 right-5 opacity-80">
              <ConditionBadge condition={nextItem1.condition} />
            </div>
            {/* Title preview on card behind */}
            <div className="absolute bottom-3 inset-x-4 text-white/90">
              <p className="text-xs font-semibold truncate">{nextItem1.title}</p>
            </div>
          </div>
        )}

        {/* Layer 0: Main Interactive Top Card */}
        {activeItem && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className={cn(
              'group absolute inset-x-0 top-0 w-full h-[calc(100%-20px)] min-h-[200px] rounded-[24px] overflow-hidden bg-[#0F172A] cursor-grab active:cursor-grabbing select-none',
              'border border-[#E2E8F0] shadow-md hover:shadow-lg',
              isDragging ? 'will-change-transform' : 'transition-all duration-300 ease-out'
            )}
            style={{
              zIndex: 30,
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${
                dragOffset.x * 0.05
              }deg)`,
              opacity: isDismissing ? 0 : 1,
              touchAction: 'pan-y',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Card Hero Image */}
            <img
              src={activeItem.imageUrl}
              alt={activeItem.title}
              loading="eager"
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = '1';
                  target.src = '/images/items/default-item.jpg';
                } else {
                  target.src = './images/items/default-item.jpg';
                }
              }}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 pointer-events-none"
            />

            {/* Top Badges: Condition on Right, City & View Count on Left */}
            <div className="absolute top-4 inset-x-4 sm:top-5 sm:inset-x-5 flex items-center justify-between z-10 pointer-events-none">
              {/* Popularity & City Tag from Explore Feed */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-xs">
                <Eye size={13} className="text-[#60A5FA] shrink-0" />
                <span className="font-num font-bold">
                  {toPersianDigits(activeItem.viewsCount || 1)}
                </span>
                <span className="text-white/60">بازدید</span>
                <span className="text-white/40">•</span>
                <span className="text-blue-100 font-semibold truncate max-w-[90px]">
                  {activeItem.city || activeItem.location || 'همه شهرها'}
                </span>
              </div>

              {/* Condition Badge matching Figma */}
              <div className="shrink-0">
                <ConditionBadge condition={activeItem.condition} />
              </div>
            </div>

            {/* Dark Scrim Overlay for crisp typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white pointer-events-none">
              <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-1 mb-1 group-hover:text-blue-200 transition-colors">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {/* Time Ago badge */}
                <div className="shrink-0 pb-0.5 text-end">
                  <span className="text-[11px] text-white/75 bg-white/15 backdrop-blur-xs px-2 py-0.5 rounded-md font-num whitespace-nowrap">
                    {activeItem.timeAgo || 'امروز'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle swipe direction visual indicator when dragging */}
            {isDragging && Math.abs(dragOffset.x) > 20 && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150',
                  dragOffset.x < 0 ? 'bg-blue-600/15' : 'bg-slate-700/15'
                )}
              >
                <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-lg border border-white/20">
                  {dragOffset.x < 0 ? (
                    <>
                      <span>هدیه بعدی</span>
                      <ChevronLeft size={16} />
                    </>
                  ) : (
                    <>
                      <ChevronRight size={16} />
                      <span>هدیه قبلی</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Side Chevrons for smooth click-based navigation */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="هدیه قبلی"
              className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 z-40 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/25 shadow-md transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="هدیه بعدی"
              className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 z-40 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/25 shadow-md transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      {/* Pagination indicators and swipe hint */}
      <div className="flex items-center justify-between px-1 mt-1">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {items.slice(0, Math.min(items.length, 8)).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`رفتن به هدیه ${toPersianDigits(idx + 1)}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                currentIndex === idx
                  ? 'w-6 bg-[#2563EB]'
                  : 'w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              )}
            />
          ))}
        </div>

        {/* Swipe instruction hint */}
        <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
          <Layers size={12} className="text-[#3B82F6]" />
          <span>برای ورق زدن بکشید</span>
        </span>
      </div>
    </div>
  );
};
