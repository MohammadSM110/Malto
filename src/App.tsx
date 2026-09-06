/**
 * Maalto Design System & Free-Donation Platform
 * 
 * Redesigned based on the Figma specification:
 * - 100% Free Donation Model (NO pricing, NO buying/selling, NO commercial checkout)
 * - Signature Electric Cobalt Blue (#2563EB) & Slate palette
 * - RTL-first layout with Persian typography (Vazirmatn) and logical properties
 * - Direct implementation of Figma components:
 *     - Feed Header with warm Persian greeting, location pin & search
 *     - Active & Inactive category pills (همه, کتاب, مبلمان, سرگرمی, پوشیدنی, ابزار, کودک)
 *     - Featured Hero Card ("دوچرخه در حد" with "سالم" condition badge)
 *     - Donation Feed Card ("لباس و سرهمی نوزادی" with text info & thumbnail)
 *     - Bottom Navigation with center "اهدا کردن" action
 *     - Donation detail and donation submission workflows
 */

import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Badge,
  ConditionBadge,
  CategoryPill,
  TagChip,
  Card,
  HeroCard,
  HeroCardData,
  DonationFeedCard,
  DonationFeedItem,
  FeedHeader,
  Header,
  BottomNavigation,
  BottomNavTab,
  Alert,
  EmptyState,
  ErrorState,
  DonationFeedCardSkeleton,
  Tabs,
  toPersianDigits,
  DonationDetailModal,
  DonateModal,
} from './design-system/index.ts';
import { ExplorePage } from './components/ExplorePage.tsx';
import { ItemDetailPage } from './components/ItemDetailPage.tsx';
import { AddItemFlow } from './components/AddItemFlow.tsx';
import { EXPLORE_ITEMS, ExploreItem } from './data/exploreData.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { RequestsManager } from './components/RequestsManager.tsx';
import { subscribeItems } from './lib/firestoreService.ts';
import {
  Gift,
  Heart,
  Sparkles,
  Layers,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Plus,
  PlusCircle,
  Compass,
  MessageSquare,
  User,
  SlidersHorizontal,
  Eye,
  LogOut,
} from 'lucide-react';

function MaaltoApp() {
  const { currentUser, userProfile, setIsAuthModalOpen, signOut } = useAuth();
  // Application & Studio State
  const [viewMode, setViewMode] = useState<'app' | 'tokens'>('app');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<BottomNavTab>('home');
  const [selectedItem, setSelectedItem] = useState<DonationFeedItem | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ExploreItem | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [requestToast, setRequestToast] = useState<string | null>(null);
  const [activeTokensTab, setActiveTokensTab] = useState('colors');

  // Real-time Firestore items synced with backend
  const [firestoreItems, setFirestoreItems] = useState<ExploreItem[]>(EXPLORE_ITEMS);

  React.useEffect(() => {
    const unsubscribe = subscribeItems((items) => {
      if (items && items.length > 0) {
        const mapped: ExploreItem[] = items.map((doc) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          categoryLabel: doc.categoryLabel,
          condition: doc.condition,
          location: doc.location || `${doc.city} / ${doc.district}`,
          city: doc.city,
          district: doc.district,
          timeAgo: 'جدید',
          imageUrl: doc.imageUrl,
          images: doc.images || [doc.imageUrl],
          donorName: doc.donorName,
          donorBadge: doc.donorBadge || 'اهداکننده تاییدشده',
          donorJoined: doc.donorJoined || '۱۴۰۳',
          donorDonatedCount: doc.donorDonatedCount || 3,
          donorResponseTime: doc.donorResponseTime || 'زیر ۳۰ دقیقه',
          donorRating: doc.donorRating || '۵.۰',
          pickupAddress: doc.pickupAddress,
          deliveryMethod: doc.deliveryMethod,
          deliveryLabel: doc.deliveryLabel,
          urgentPickup: doc.urgentPickup,
          viewsCount: doc.viewsCount || 1,
          requestsCount: doc.requestsCount || 0,
          specs: doc.specs,
        }));
        setFirestoreItems(mapped);

        // Also sync to donationItems
        const feedMapped: DonationFeedItem[] = mapped.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          condition: i.condition,
          timeAgo: i.timeAgo,
          imageUrl: i.imageUrl,
          donorName: i.donorName,
          location: i.location,
        }));
        setDonationItems(feedMapped);
      }
    });

    return () => unsubscribe();
  }, []);

  // Featured Item from Figma ("دوچرخه در حد")
  const featuredItem: HeroCardData = {
    id: 'hero-bike',
    title: 'دوچرخه در حد نو سایز ۲۶',
    description: 'کاملاً سالم و کم‌کارکرد، اهدای رایگان به دانش‌آموز یا فرد علاقه‌مند به ورزش.',
    condition: 'سالم',
    timeAgo: 'دیروز',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    donorName: 'محمدرضا کاظمی',
    city: 'تهران / شهرک غرب',
  };

  // Donation Feed Items matching the Figma design & expanded free items
  const [donationItems, setDonationItems] = useState<DonationFeedItem[]>([
    {
      id: 'feed-baby-clothes',
      title: 'لباس و سرهمی نوزادی',
      description: 'چند دست سرهمی و پاپوش کاملاً نو و سالم، جنس نخ پنبه ضد حساسیت.',
      condition: 'سالم',
      timeAgo: 'دیروز',
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      donorName: 'سارا رادمهر',
      location: 'تهران / شهرک غرب',
    },
    {
      id: 'feed-desk',
      title: 'میز مطالعه و تحریر چوبی تاشو',
      description: 'میز کار چوبی سبک با پایه‌های فلزی مقاوم، مناسب اتاق خواب و مطالعه.',
      condition: 'در حد نو',
      timeAgo: 'امروز',
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
      donorName: 'امیرحسین پارسا',
      location: 'تهران / سعادت‌آباد',
    },
    {
      id: 'feed-books',
      title: 'مجموعه کتاب‌های رمان و داستان‌های کلاسیک',
      description: '۱۲ جلد کتاب نفیس ادبیات فارسی و رمان‌های مطرح جهان با صحافی تمیز.',
      condition: 'سالم',
      timeAgo: '۲ روز پیش',
      imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
      donorName: 'دکتر بهرامی',
      location: 'تهران / پونک',
    },
    {
      id: 'feed-guitar',
      title: 'گیتار کلاسیک یاماها مدل C40',
      description: 'ساز تمیز همراه با کاور ضدآب، اهدای رایگان به هنرجوی مبتدی موسیقی.',
      condition: 'سالم',
      timeAgo: '۳ روز پیش',
      imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
      donorName: 'نیما علیزاده',
      location: 'تهران / ستارخان',
    },
    {
      id: 'feed-plant',
      title: 'گلدان سانسوریا ابلق بزرگ همراه با پایه',
      description: 'گیاه آپارتمانی شاداب و تصفیه‌کننده هوا با خاک تقویت‌شده و گلدان سرامیکی.',
      condition: 'کاملاً نو',
      timeAgo: 'دیروز',
      imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
      donorName: 'مهشید رضوی',
      location: 'تهران / صادقیه',
    },
  ]);

  // Categories list directly from Figma
  const categories = [
    { id: 'all', label: 'همه' },
    { id: 'book', label: 'کتاب' },
    { id: 'furniture', label: 'مبلمان' },
    { id: 'entertainment', label: 'سرگرمی' },
    { id: 'clothing', label: 'پوشیدنی' },
    { id: 'tools', label: 'ابزار' },
    { id: 'kids', label: 'کودک' },
  ];

  // Toggle Direction (RTL/LTR)
  const toggleDirection = () => {
    const nextDir = dir === 'rtl' ? 'ltr' : 'rtl';
    setDir(nextDir);
    document.documentElement.setAttribute('dir', nextDir);
    document.documentElement.setAttribute('lang', nextDir === 'rtl' ? 'fa' : 'en');
  };

  // Filtered donation items
  const filteredDonations = donationItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle donation submission
  const handleAddNewItem = (newItem: {
    title: string;
    description: string;
    condition: string;
    location: string;
    category: string;
  }) => {
    const created: DonationFeedItem = {
      id: `feed-${Date.now()}`,
      title: newItem.title,
      description: newItem.description,
      condition: newItem.condition,
      timeAgo: 'لحظاتی پیش',
      imageUrl:
        newItem.category === 'پوشیدنی'
          ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
          : newItem.category === 'کتاب'
          ? 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
      donorName: 'شما (اهداکننده)',
      location: newItem.location,
    };
    setDonationItems([created, ...donationItems]);
    setRequestToast(`هدیه «${newItem.title}» با موفقیت برای اهدای رایگان ثبت گردید.`);
    setTimeout(() => setRequestToast(null), 4000);
  };

  // Handle request for item
  const handleRequestItem = (item: DonationFeedItem) => {
    setRequestToast(`درخواست شما برای دریافت «${item.title}» ثبت شد. پیام شما به اهداکننده ارسال گردید.`);
    setTimeout(() => setRequestToast(null), 4000);
  };

  return (
    <div
      dir={dir}
      className={`min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col transition-colors duration-200 ${
        dir === 'rtl' ? 'font-persian' : 'font-latin'
      }`}
    >
      {/* Universal Desktop/Tablet Header */}
      <Header
        currentLang={dir === 'rtl' ? 'fa' : 'en'}
        onToggleLang={toggleDirection}
        unreadCount={1}
        onSearchClick={() => {
          setViewMode('app');
          setMobileTab('explore');
        }}
        onNotificationsClick={() => {
          setViewMode('app');
          setIsAddItemOpen(false);
          setSelectedDetailItem(null);
          setMobileTab('messages');
        }}
        onProfileClick={() => setIsAuthModalOpen(true)}
        onDonateClick={() => setIsDonateModalOpen(true)}
      />

      {/* Mode Switcher & Global Controls Banner */}
      <div className="w-full bg-white border-b border-[#E2E8F0] py-2 px-4 select-none">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
              <Gift size={15} />
              <span>پلتفرم اهدای رایگان مالتو (بدون قیمت و خرید/فروش)</span>
            </span>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] transition-colors cursor-pointer"
            >
              <User size={13} className="text-[#2563EB]" />
              <span className="font-semibold">
                {userProfile?.displayName ? userProfile.displayName : currentUser ? 'کاربر متصل' : 'ورود / هویت'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setViewMode('app');
                  setIsAddItemOpen(false);
                  setSelectedDetailItem(null);
                  setMobileTab('home');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'app' && !isAddItemOpen && !selectedDetailItem && mobileTab === 'home'
                    ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Smartphone size={14} />
                <span>خانه (فید فیگما)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('app');
                  setIsAddItemOpen(false);
                  setSelectedDetailItem(null);
                  setMobileTab('explore');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'app' && !isAddItemOpen && !selectedDetailItem && mobileTab === 'explore'
                    ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Compass size={14} />
                <span>کاوش هدایا (Explore)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('app');
                  setIsAddItemOpen(true);
                  setSelectedDetailItem(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'app' && isAddItemOpen
                    ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <PlusCircle size={14} />
                <span>ثبت هدیه (Add Item)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('app');
                  setIsAddItemOpen(false);
                  setSelectedDetailItem(selectedDetailItem || EXPLORE_ITEMS[0]);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'app' && !isAddItemOpen && selectedDetailItem
                    ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Eye size={14} />
                <span>جزئیات کالا (Detail)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('tokens');
                  setIsAddItemOpen(false);
                  setSelectedDetailItem(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'tokens'
                    ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Layers size={14} />
                <span>دیزاین سیستم و توکن‌ها</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleDirection}
              className="text-xs h-8 px-2.5"
            >
              {dir.toUpperCase()} ({dir === 'rtl' ? 'راست‌چین' : 'چپ‌چین'})
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action / Feedback Toast */}
      {requestToast && (
        <div className="fixed top-20 inset-inline-end-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-[#0F172A] text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm border border-slate-700">
            <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
            <span className="leading-relaxed">{requestToast}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: THE FIGMA FREE-DONATION APP INTERFACE */}
      {/* ========================================================================= */}
      {viewMode === 'app' && (
        <>
          {/* ADD ITEM VIEW: MAALTO ADD GIVEAWAY FLOW */}
          {isAddItemOpen ? (
            <main className="flex-1 w-full pb-24">
              <AddItemFlow
                onClose={() => setIsAddItemOpen(false)}
                onSuccess={(createdItem) => {
                  setDonationItems((prev) => [
                    {
                      id: createdItem.id,
                      title: createdItem.title,
                      description: createdItem.description,
                      condition: createdItem.condition,
                      timeAgo: createdItem.timeAgo,
                      imageUrl: createdItem.imageUrl,
                      donorName: createdItem.donorName,
                      location: createdItem.location,
                    },
                    ...prev,
                  ]);
                  EXPLORE_ITEMS.unshift(createdItem);
                  setRequestToast(`هدیه «${createdItem.title}» با موفقیت در شبکه مالتو ثبت و منتشر شد!`);
                  setTimeout(() => setRequestToast(null), 5000);
                }}
                onViewItem={(item) => {
                  setIsAddItemOpen(false);
                  setSelectedDetailItem(item);
                }}
              />
            </main>
          ) : selectedDetailItem ? (
            <main className="flex-1 w-full pb-24">
              <ItemDetailPage
                item={selectedDetailItem}
                onBack={() => setSelectedDetailItem(null)}
                onSelectRelatedItem={(item) => setSelectedDetailItem(item)}
                onRequestSubmitted={(item, message) => {
                  setRequestToast(`درخواست شما برای «${item.title}» ثبت شد. پیام شما به ${item.donorName} ارسال گردید.`);
                  setTimeout(() => setRequestToast(null), 4000);
                }}
              />
            </main>
          ) : (
            <>
              {/* TAB 1: HOME FEED */}
              {mobileTab === 'home' && (
                <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4 pb-24">
                  {/* Feed Header directly matching Figma */}
                  <FeedHeader
                    greeting="کاربر عزیز امروز چی می‌خوای مالتو باشه:)"
                    location="تهران / شهرک غرب"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                  />

                  {/* Golden Rule Notice for Free Donation */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-xs text-[#334155]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span className="font-semibold text-[#0F172A]">مالتو ۱۰۰٪ رایگان است</span>
                    </div>
                    <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-medium">
                      بدون هزینه و فروش
                    </span>
                  </div>

                  {/* Featured Hero Card from Figma ("دوچرخه در حد") */}
                  <section>
                    <HeroCard
                      data={featuredItem}
                      onClick={() => {
                        const matching = EXPLORE_ITEMS.find((i) => i.id === 'exp-bike-26') || EXPLORE_ITEMS[0];
                        setSelectedDetailItem(matching);
                      }}
                    />
                  </section>

                  {/* Feed List Header */}
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      جدیدترین کالاهای اهدایی
                    </h2>
                    <span className="text-xs text-[#64748B] font-num">
                      {toPersianDigits(filteredDonations.length)} مورد موجود
                    </span>
                  </div>

                  {/* Feed List Cards directly matching Figma ("لباس و سرهمی نوزادی") */}
                  <div className="flex flex-col gap-3">
                    {filteredDonations.length > 0 ? (
                      filteredDonations.map((item) => (
                        <DonationFeedCard
                          key={item.id}
                          item={item}
                          onClick={() => {
                            const matching = EXPLORE_ITEMS.find((i) => i.title.includes(item.title) || item.title.includes(i.title)) || {
                              id: item.id,
                              title: item.title,
                              description: item.description,
                              category: 'clothing',
                              categoryLabel: 'پوشیدنی و لوازم',
                              condition: item.condition as any,
                              location: item.location,
                              city: 'تهران',
                              district: item.location.split('/')[1]?.trim() || 'شهرک غرب',
                              timeAgo: item.timeAgo,
                              imageUrl: item.imageUrl,
                              images: [item.imageUrl],
                              donorName: item.donorName,
                              donorBadge: 'کاربر تاییدشده مالتو',
                              deliveryMethod: 'pickup' as const,
                              deliveryLabel: 'تحویل حضوری رایگان',
                              viewsCount: 110,
                              requestsCount: 4,
                            };
                            setSelectedDetailItem(matching);
                          }}
                        />
                      ))
                    ) : (
                      <EmptyState
                        title="موردی یافت نشد"
                        description={`هیچ هدیه‌ای با عبارت «${searchQuery}» پیدا نشد.`}
                        actionLabel="پاک کردن جستجو"
                        onAction={() => setSearchQuery('')}
                      />
                    )}
                  </div>
                </main>
              )}

              {/* TAB 2: EXPLORE PAGE */}
              {mobileTab === 'explore' && (
                <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
                  <ExplorePage
                    items={firestoreItems}
                    onSelectItem={(item) => {
                      setSelectedDetailItem(item);
                    }}
                    onRequestDonation={(item) => {
                      setSelectedDetailItem(item);
                    }}
                    onOpenDonateModal={() => setIsAddItemOpen(true)}
                  />
                </main>
              )}

              {/* TAB 3: MESSAGES & REQUESTS MANAGER (Firebase Realtime) */}
              {mobileTab === 'messages' && (
                <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-4 pb-24">
                  <RequestsManager onExploreClick={() => setMobileTab('explore')} />
                </main>
              )}

              {/* TAB 4: PROFILE TAB WITH FIREBASE AUTH */}
              {mobileTab === 'profile' && (
                <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col gap-4 pb-24 text-start">
                  <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                          {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'م'}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#0F172A]">
                            {userProfile?.displayName || 'کاربر مالتو'}
                          </h2>
                          <span className="text-xs text-[#2563EB] font-medium bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                            {userProfile?.verified ? 'کاربر تاییدشده پایگاه داده' : 'عضو فعال جامعه بخشش کالا'}
                          </span>
                          <p className="text-[11px] text-[#94A3B8] mt-1">
                            {userProfile?.city || 'تهران'} / {userProfile?.district || 'شهرک غرب'}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-xs text-[#2563EB]"
                      >
                        تغییر حساب
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9]">
                      <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                        <span className="text-lg font-black text-[#2563EB] font-num block">
                          {toPersianDigits(userProfile?.donatedCount ?? 3)}
                        </span>
                        <span className="text-xs text-[#64748B]">کالای اهدا شده</span>
                      </div>
                      <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                        <span className="text-lg font-black text-[#16A34A] font-num block">
                          {toPersianDigits(userProfile?.receivedCount ?? 2)}
                        </span>
                        <span className="text-xs text-[#64748B]">هدیه دریافت شده</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAddItemOpen(true)}
                        startIcon={<Plus size={14} />}
                        className="w-full"
                      >
                        ثبت هدیه جدید برای اهدای رایگان
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAuthModalOpen(true)}
                        startIcon={<User size={14} />}
                        className="w-full"
                      >
                        مدیریت حساب و احراز هویت (Firebase Auth)
                      </Button>
                      {currentUser && (
                        <button
                          type="button"
                          onClick={() => signOut()}
                          className="text-xs text-rose-600 hover:text-rose-700 py-1 font-medium flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <LogOut size={13} />
                          <span>خروج از حساب کاربری</span>
                        </button>
                      )}
                    </div>
                  </div>
                </main>
              )}
            </>
          )}

          {/* Fixed Bottom Navigation matching Figma */}
          <BottomNavigation
            activeTab={isAddItemOpen ? 'donate' : mobileTab}
            onTabChange={(tab) => {
              setSelectedDetailItem(null);
              if (tab === 'donate') {
                setIsAddItemOpen(true);
              } else {
                setIsAddItemOpen(false);
                setMobileTab(tab);
              }
            }}
            messageBadgeCount={1}
            isFixed={true}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DESIGN SYSTEM TOKENS & COMPONENTS DOCUMENTATION */}
      {/* ========================================================================= */}
      {viewMode === 'tokens' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
          <div className="p-6 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs text-start">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-2">
              <Sparkles size={16} />
              <span>مستندات سیستم طراحی مالتو • Maalto Design System</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
              سیستم طراحی پلتفرم اهدای رایگان کالا
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
              طراحی اختصاصی با الهام از نسخه فیگما، تایپوگرافی فارسی وزیرمتن، رنگ شاخص آبی کبالت برقی (#2563EB)،
              پس‌زمینه آرام Slate (#F8FAFC) و کارت‌های تمیز بدون المان‌های تجاری، قیمت‌گذاری یا سبد خرید.
            </p>

            {/* Tokens Tab navigation */}
            <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
              <Tabs
                activeId={activeTokensTab}
                onChange={setActiveTokensTab}
                variant="pills"
                items={[
                  { id: 'colors', label: '۱. پالت رنگی فیگما' },
                  { id: 'badges', label: '۲. نشان‌های وضعیت و پیلوها' },
                  { id: 'buttons', label: '۳. دکمه‌ها و فرم‌ها' },
                  { id: 'cards', label: '۴. ساختار کارت‌های هدیه' },
                  { id: 'feedback', label: '۵. بازخوردها و قوانین' },
                ]}
              />
            </div>
          </div>

          {/* Tokens: Colors */}
          {activeTokensTab === 'colors' && (
            <Card padding="lg" className="flex flex-col gap-6">
              <div className="text-start">
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  پالت رنگی استخراج شده از فیگما
                </h3>
                <p className="text-xs text-[#64748B]">
                  رنگ‌های دقیق بر اساس سوییچ‌های طراحی و مدل رایگان مالتو
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Electric Blue */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col gap-2.5 text-start">
                  <div className="w-full h-14 rounded-xl bg-[#2563EB] shadow-sm" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Electric Cobalt Blue</span>
                    <span className="text-[11px] font-mono text-[#64748B]">#2563EB • اصلی فیگما</span>
                    <span className="text-[10px] text-[#2563EB] block mt-0.5">پیلوهای فعال، دکمه اهدا</span>
                  </div>
                </div>

                {/* Charcoal Dark */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col gap-2.5 text-start">
                  <div className="w-full h-14 rounded-xl bg-[#0F172A]" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Deep Charcoal</span>
                    <span className="text-[11px] font-mono text-[#64748B]">#0F172A • متون اصلی</span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">کنتراست AAA فارسی</span>
                  </div>
                </div>

                {/* Slate Canvas */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col gap-2.5 text-start">
                  <div className="w-full h-14 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Slate Canvas</span>
                    <span className="text-[11px] font-mono text-[#64748B]">#F8FAFC • کنواس</span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">پس‌زمینه آرام اپلیکیشن</span>
                  </div>
                </div>

                {/* Crisp White Surface */}
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col gap-2.5 text-start">
                  <div className="w-full h-14 rounded-xl bg-white border border-[#E2E8F0]" />
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Crisp Surface</span>
                    <span className="text-[11px] font-mono text-[#64748B]">#FFFFFF • کارت‌ها</span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">کارت‌های لیست کالا</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tokens: Badges & Pills */}
          {activeTokensTab === 'badges' && (
            <Card padding="lg" className="flex flex-col gap-6 text-start">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  نشان وضعیت کالا و پیلوهای دسته‌بندی
                </h3>
                <p className="text-xs text-[#64748B]">
                  نشان «سالم» با ترنسپرنسی و حاشیه ظریف بر اساس کارت دوچرخه فیگما
                </p>
              </div>

              {/* Condition badges */}
              <div className="flex flex-wrap items-center gap-3">
                <ConditionBadge condition="سالم" />
                <ConditionBadge condition="کاملاً نو" />
                <ConditionBadge condition="در حد نو" />
                <ConditionBadge condition="نیازمند تعمیر" />
              </div>

              {/* Category pills from Figma */}
              <div className="border-t border-[#E2E8F0] pt-4">
                <span className="text-xs font-semibold text-[#64748B] block mb-2.5">
                  پیلوهای افقی دسته‌بندی (کاروسل فیگما):
                </span>
                <div className="flex flex-wrap gap-2">
                  <CategoryPill isActive>همه</CategoryPill>
                  <CategoryPill>کتاب</CategoryPill>
                  <CategoryPill>مبلمان</CategoryPill>
                  <CategoryPill>سرگرمی</CategoryPill>
                  <CategoryPill>پوشیدنی</CategoryPill>
                  <CategoryPill>ابزار</CategoryPill>
                  <CategoryPill>کودک</CategoryPill>
                </div>
              </div>
            </Card>
          )}

          {/* Tokens: Buttons & Forms */}
          {activeTokensTab === 'buttons' && (
            <Card padding="lg" className="flex flex-col gap-6 text-start">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  دکمه‌ها و فیلدهای ورودی فرم اهدا
                </h3>
                <p className="text-xs text-[#64748B]">
                  بدون فیلدهای تجاری؛ متمرکز بر مشخصات کالا، موقعیت محلی و سلامت شیء
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary">دکمه اصلی (کبالت فیگما)</Button>
                <Button variant="secondary">دکمه تیره (گرافیت)</Button>
                <Button variant="outline">خطی (Outline)</Button>
                <Button variant="subtle">ملایم (Subtle)</Button>
                <Button variant="ghost">شیشه‌ای (Ghost)</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-4">
                <Input
                  label="عنوان وسیله اهدایی"
                  placeholder="مثلاً: دوچرخه کوهستان، کمد لباس..."
                  defaultValue="دوچرخه کوهستان سایز ۲۶"
                />
                <Input
                  label="محله و شهر تحویل"
                  placeholder="تهران / شهرک غرب"
                  defaultValue="تهران / شهرک غرب"
                />
              </div>

              <Textarea
                label="توضیحات و سلامت کالا"
                defaultValue="این وسیله کاملاً سالم بوده و جهت استفاده رایگان به یکی از اعضای محترم مالتو اهدا می‌گردد."
                rows={3}
              />
            </Card>
          )}

          {/* Tokens: Cards Structure */}
          {activeTokensTab === 'cards' && (
            <Card padding="lg" className="flex flex-col gap-6 text-start">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  ساختار کارت‌های هدیه مالتو
                </h3>
                <p className="text-xs text-[#64748B]">
                  کارت برجسته هدر (Hero Card) و کارت‌های لیست فید (Donation Feed Card)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#64748B] block mb-2">
                    ۱. کارت لیست فید (از تصویر فیگما):
                  </span>
                  <DonationFeedCard
                    item={donationItems[0]}
                    onClick={() => setSelectedItem(donationItems[0])}
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#64748B] block mb-2">
                    ۲. حالت در حال بارگذاری (Skeleton):
                  </span>
                  <DonationFeedCardSkeleton />
                </div>
              </div>
            </Card>
          )}

          {/* Tokens: Feedback & Rules */}
          {activeTokensTab === 'feedback' && (
            <Card padding="lg" className="flex flex-col gap-4 text-start">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  قوانین طلایی مالتو و وضعیت‌های بازخورد
                </h3>
                <p className="text-xs text-[#64748B]">
                  تأکید بر اهدای صددرصد رایگان و جلوگیری از هرگونه دادوستد مالی
                </p>
              </div>

              <Alert type="info" title="قانون طلایی مالتو">
                مالتو یک پلتفرم اهدای رایگان است. هرگونه پیشنهاد یا درخواست وجه نقد، هزینه کارشناسی یا پرداخت پول در ازای واگذاری کالا خلاف مقررات جامعه مالتو است.
              </Alert>

              <Alert type="success" title="هدیه شما با موفقیت ثبت شد">
                اطلاعات وسیله به فید محله ارسال شد و متقاضیان می‌توانند بدون واسطه پیام دهند.
              </Alert>
            </Card>
          )}
        </main>
      )}

      {/* Item Detail Modal */}
      <DonationDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onRequestDonation={handleRequestItem}
      />

      {/* Donate New Item Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        onSubmitItem={handleAddNewItem}
      />

      {/* Realtime Firebase Authentication & Identity Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MaaltoApp />
    </AuthProvider>
  );
}
