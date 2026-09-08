import React, { useState, useMemo } from 'react';
import {
  EXPLORE_ITEMS,
  EXPLORE_CATEGORIES,
  DISTRICTS,
  CONDITIONS,
  ExploreItem,
} from '../data/exploreData.ts';
import {
  Button,
  Input,
  CategoryPill,
  ConditionBadge,
  Badge,
  Alert,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../design-system/index.ts';
import { ExploreItemCard } from '../design-system/components/ExploreItemCard.tsx';
import { toPersianDigits } from '../design-system/utils/persian.ts';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  Sparkles,
  Zap,
  MapPin,
  Check,
  X,
  RefreshCw,
  Gift,
  ShieldCheck,
  Clock,
  Compass,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

export interface ExplorePageProps {
  items?: ExploreItem[];
  isLoading?: boolean;
  error?: string | null;
  onSelectItem?: (item: ExploreItem) => void;
  onRequestDonation?: (item: ExploreItem) => void;
  onOpenDonateModal?: () => void;
  className?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  items,
  isLoading: isLoadingProp,
  error: errorProp,
  onSelectItem,
  onRequestDonation,
  onOpenDonateModal,
  className,
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('همه محله‌ها');
  const [selectedCondition, setSelectedCondition] = useState('همه وضعیت‌ها');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'pickup' | 'courier'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'urgent'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // States for verification & interaction
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const effectiveLoading = isLoadingProp !== undefined ? isLoadingProp : isLoading;
  const effectiveError = Boolean(errorProp || hasError);

  // Quick discovery chips
  const quickSearches = [
    'دوچرخه',
    'میز تحریر',
    'کتاب کنکور',
    'لباس نوزادی',
    'گلدان سانسوریا',
    'جعبه ابزار',
  ];

  // Filtering & Sorting Logic
  const sourceItems = items && items.length > 0 ? items : EXPLORE_ITEMS;

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    sourceItems.forEach((i) => {
      if (i.district) set.add(i.district);
    });
    return ['همه محله‌ها', ...Array.from(set)];
  }, [sourceItems]);

  const filteredItems = useMemo(() => {
    return sourceItems.filter((item) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesDonor = item.donorName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesLocation && !matchesDonor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'همه محله‌ها' && item.district !== selectedDistrict) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'همه وضعیت‌ها' && item.condition !== selectedCondition) {
        return false;
      }

      // Urgent filter
      if (onlyUrgent && !item.urgentPickup) {
        return false;
      }

      // Delivery filter
      if (deliveryFilter === 'pickup' && item.deliveryMethod !== 'pickup' && item.deliveryMethod !== 'any') {
        return false;
      }
      if (deliveryFilter === 'courier' && item.deliveryMethod !== 'courier' && item.deliveryMethod !== 'any') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        // Internal ranking signal based on views count (descending)
        const viewsDiff = (b.viewsCount || 0) - (a.viewsCount || 0);
        if (viewsDiff !== 0) return viewsDiff;
        return (b.requestsCount || 0) - (a.requestsCount || 0);
      }
      if (sortBy === 'urgent') {
        return (b.urgentPickup ? 1 : 0) - (a.urgentPickup ? 1 : 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });
  }, [sourceItems, searchQuery, selectedCategory, selectedDistrict, selectedCondition, onlyUrgent, deliveryFilter, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDistrict('همه محله‌ها');
    setSelectedCondition('همه وضعیت‌ها');
    setOnlyUrgent(false);
    setDeliveryFilter('all');
    setSortBy('popular');
    setHasError(false);
  };

  // Count active filters
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedDistrict !== 'همه محله‌ها' ? 1 : 0) +
    (selectedCondition !== 'همه وضعیت‌ها' ? 1 : 0) +
    (onlyUrgent ? 1 : 0) +
    (deliveryFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Trigger simulated loading
  const handleTriggerLoading = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className={`w-full flex flex-col gap-6 text-start select-none ${className || ''}`}>
      {/* 1. Header & Context Banner */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] mb-1.5">
              <Compass size={16} className="shrink-0" />
              <span>کاوش و کشف هدایای رایگان • Maalto Explore</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mb-1">
              جستجو و کشف وسایل اهدایی در محله‌های شما
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              هزاران وسیله کاملاً سالم، کتاب، دوچرخه، مبلمان و لباس اهدایی آماده واگذاری رایگان به همشهریان
            </p>
          </div>

          {/* Quick simulation controls for UI review */}
          <div className="flex items-center gap-2 shrink-0 bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={handleTriggerLoading}
              className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isLoading
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]'
              }`}
              title="تست حالت بارگذاری با اسکلتون"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>تست لودینگ</span>
            </button>
            <button
              type="button"
              onClick={() => setHasError(!hasError)}
              className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                hasError
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]'
              }`}
              title="تست نمایش خطای دریافت داده"
            >
              <AlertTriangle size={12} />
              <span>تست خطا</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input - Search icon on LEFT side with appropriate padding */}
        <div className="relative w-full">
          {/* Search icon on the LEFT side */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#94A3B8]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در میان وسایل اهدایی (مثلاً: دوچرخه، میز مطالعه، کتاب کنکور، گیتار...)"
            className={`w-full bg-[#F8FAFC] text-[#0F172A] text-sm rounded-2xl border border-[#E2E8F0] py-3.5 pl-11 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition-all shadow-xs ${
              searchQuery ? 'pr-9' : 'pr-4'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg cursor-pointer transition-colors"
              aria-label="پاک کردن جستجو"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">
            پیشنهادات جستجو:
          </span>
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setSearchQuery(term)}
              className="text-xs bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer border border-[#E2E8F0]/60"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Free Donation Golden Rule Callout */}
        <div className="flex items-center justify-between p-3 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] text-xs text-[#1D4ED8]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#2563EB] shrink-0" />
            <span className="font-medium">
              تمامی اقلام موجود در مالتو <strong>۱۰۰٪ رایگان</strong> هستند و هیچ‌گونه دریافت وجه یا پرداخت هزینه‌ای وجود ندارد.
            </span>
          </div>
          {onOpenDonateModal && (
            <button
              type="button"
              onClick={onOpenDonateModal}
              className="hidden md:inline-flex items-center gap-1 font-bold underline underline-offset-4 hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
            >
              + شما هم چیزی اهدا کنید
            </button>
          )}
        </div>
      </section>

      {/* 2. Categories Carousel Bar */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#475569]">
            دسته‌بندی‌های کالاهای اهدایی:
          </span>
          <span className="text-xs text-[#94A3B8] font-num">
            {toPersianDigits(EXPLORE_CATEGORIES.length - 1)} دسته تخصصی
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {EXPLORE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? EXPLORE_ITEMS.length
                : EXPLORE_ITEMS.filter((i) => i.category === cat.id).length;

            return (
              <CategoryPill
                key={cat.id}
                isActive={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-1.5"
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-num ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              </CategoryPill>
            );
          })}
        </div>
      </section>

      {/* 3. Filter Bar & Quick Discovery Controls */}
      <section className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left / Start: Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>فیلترهای پیشرفته</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center font-num">
                  {toPersianDigits(activeFiltersCount)}
                </span>
              )}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isFilterPanelOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Quick Urgent Discovery Filter */}
            <button
              type="button"
              onClick={() => setOnlyUrgent(!onlyUrgent)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyUrgent
                  ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <Zap size={14} className={onlyUrgent ? 'text-[#DC2626]' : 'text-[#94A3B8]'} />
              <span>فقط تحویل فوری (امروز)</span>
            </button>

            {/* District Quick Select */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Condition Quick Select */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="text-xs bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Clear Filters (if active) */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#DC2626] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>پاک‌سازی فیلترها</span>
              </button>
            )}
          </div>

          {/* Right / End: Sort and View Modes */}
          <div className="flex items-center gap-2 ms-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span>مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-medium"
              >
                <option value="popular">محبوب‌ترین‌ها (سراسر شهرها)</option>
                <option value="newest">جدیدترین‌ها</option>
                <option value="urgent">تحویل فوری</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                title="نمای شبکه‌ای"
                aria-label="نمای شبکه‌ای"
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                title="نمای فهرست افقی"
                aria-label="نمای فهرست افقی"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {isFilterPanelOpen && (
          <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Delivery Method Filter */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                شیوه تحویل کالا:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'همه روش‌ها' },
                  { id: 'pickup', label: 'تحویل حضوری' },
                  { id: 'courier', label: 'ارسال با پیک' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDeliveryFilter(item.id as any)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      deliveryFilter === item.id
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick condition selector */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                وضعیت سلامت شیء:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCondition(c)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedCondition === c
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* District direct pills */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                محله‌های تحت پوشش:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDistrict(d)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      selectedDistrict === d
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#94A3B8]">فیلترهای فعال:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                <span>جستجو: «{searchQuery}»</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                <span>
                  دسته:{' '}
                  {EXPLORE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedDistrict !== 'همه محله‌ها' && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                <span>محله: {selectedDistrict}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDistrict('همه محله‌ها')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCondition !== 'همه وضعیت‌ها' && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                <span>وضعیت: {selectedCondition}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCondition('همه وضعیت‌ها')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {onlyUrgent && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 rounded-md">
                <span>فقط تحویل فوری</span>
                <button
                  type="button"
                  onClick={() => setOnlyUrgent(false)}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {deliveryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                <span>
                  تحویل: {deliveryFilter === 'pickup' ? 'حضوری' : 'ارسال با پیک'}
                </span>
                <button
                  type="button"
                  onClick={() => setDeliveryFilter('all')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* 4. Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
            کالاهای یافت‌شده برای واگذاری
          </h2>
          <span className="text-xs bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full font-num border border-[#E2E8F0]">
            {toPersianDigits(filteredItems.length)} کالا
          </span>
        </div>
        <span className="text-xs text-[#94A3B8]">
          کلیک روی هر کالا جهت مشاهده و درخواست
        </span>
      </div>

      {/* 5. Main Results Container with Loading / Error / Empty / Success states */}
      <div>
        {/* Error State */}
        {effectiveError ? (
          <div className="my-6">
            <ErrorState
              title="خطا در دریافت لیست کالاهای اهدایی"
              message={errorProp || "ارتباط با پایگاه داده هدایای مالتو برقرار نشد یا بارگذاری اطلاعات با تأخیر مواجه شد. لطفاً دوباره تلاش فرمایید."}
              onRetry={() => {
                setHasError(false);
                handleTriggerLoading();
              }}
            />
          </div>
        ) : effectiveLoading ? (
          /* Loading State (Skeletons) */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] p-0 flex flex-col"
                >
                  <Skeleton className="w-full aspect-[4/3] rounded-none" />
                  <div className="p-4 flex flex-col gap-2.5">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-4/5 rounded-md" />
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                      <Skeleton className="h-3 w-16 rounded-md" />
                      <Skeleton className="h-3 w-12 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] flex items-center justify-between gap-3"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-3 w-16 rounded-md" />
                      <Skeleton className="h-3 w-12 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
                </div>
              ))}
            </div>
          )
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="my-8">
            <EmptyState
              icon={<Gift size={32} className="stroke-[1.5]" />}
              title="هیچ کالای اهدایی یافت نشد"
              description={
                searchQuery
                  ? `هیچ هدیه‌ای با عبارت «${searchQuery}» و فیلترهای انتخابی شما پیدا نشد. می‌توانید با کلمات دیگر جستجو کرده یا فیلترها را حذف کنید.`
                  : 'در حال حاضر کالایی با ترکیب فیلترهای انتخابی در دسترس نیست. می‌توانید فیلترها را بازنشانی فرمایید.'
              }
              actionLabel="پاک کردن همه فیلترها"
              onAction={handleResetFilters}
              secondaryActionLabel={onOpenDonateModal ? "ثبت این کالا برای اهدا" : undefined}
              onSecondaryAction={onOpenDonateModal}
            />
          </div>
        ) : (
          /* Success Item Results */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ExploreItemCard
                  key={item.id}
                  item={item}
                  viewMode="grid"
                  onClick={() => onSelectItem?.(item)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredItems.map((item) => (
                <ExploreItemCard
                  key={item.id}
                  item={item}
                  viewMode="list"
                  onClick={() => onSelectItem?.(item)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
