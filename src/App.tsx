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
import { APP_CONFIG, CATEGORIES_CONFIG } from './design-system/config/navigation.ts';
import { ExplorePage } from './components/ExplorePage.tsx';
import { ItemDetailPage } from './components/ItemDetailPage.tsx';
import { AddItemFlow } from './components/AddItemFlow.tsx';
import { EXPLORE_ITEMS, ExploreItem } from './data/exploreData.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { RequestsManager } from './components/RequestsManager.tsx';
import {
  subscribeItems,
  subscribeNotifications,
  subscribeDonorRequests,
  updateItem,
  deleteItem,
  incrementItemViews,
  seedInitialDataIfEmpty,
} from './lib/firestoreService.ts';
import { NotificationDoc, ItemRequestDoc } from './types/backend.ts';
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
  Trash2,
} from 'lucide-react';

function formatPersianTimeAgo(isoString?: string): string {
  if (!isoString) return 'جدید';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'دیروز';
  return `${toPersianDigits(diffDays)} روز پیش`;
}

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
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // Real-time backend notifications and incoming requests
  const [realNotifications, setRealNotifications] = useState<NotificationDoc[]>([]);
  const [realIncomingRequests, setRealIncomingRequests] = useState<ItemRequestDoc[]>([]);
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    services?: Record<string, string>;
  } | null>(null);

  // Frontend -> Backend communication check
  React.useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth(data);
      })
      .catch((err) => {
        console.warn('Backend /api/health check:', err);
      });
  }, []);

  React.useEffect(() => {
    setIsLoadingItems(true);
    // Seed initial dataset if database is empty on first boot
    seedInitialDataIfEmpty(currentUser?.uid);

    const unsubscribe = subscribeItems((items) => {
      setIsLoadingItems(false);
      setItemsError(null);
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
          timeAgo: (doc as any).timeAgo || formatPersianTimeAgo(doc.createdAt),
          createdAt: doc.createdAt || new Date().toISOString(),
          imageUrl: doc.imageUrl,
          images: doc.images || [doc.imageUrl],
          donorId: doc.donorId,
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
          status: doc.status,
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
      } else {
        setFirestoreItems(EXPLORE_ITEMS);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Realtime subscription to user's notifications and received requests
  React.useEffect(() => {
    const currentUserId = userProfile?.uid || currentUser?.uid;
    if (!currentUserId) {
      setRealNotifications([]);
      setRealIncomingRequests([]);
      return;
    }

    const unsubNotifs = subscribeNotifications(currentUserId, (list) => {
      setRealNotifications(list);
    });

    const unsubReqs = subscribeDonorRequests(currentUserId, (reqs) => {
      setRealIncomingRequests(reqs);
    });

    return () => {
      unsubNotifs();
      unsubReqs();
    };
  }, [currentUser?.uid, userProfile?.uid]);

  const realUnreadNotifsCount = realNotifications.filter((n) => !n.read).length;
  const realPendingRequestsCount = realIncomingRequests.filter((r) => r.status === 'pending').length;
  const realTotalBadgeCount = realUnreadNotifsCount + realPendingRequestsCount;

  // Active user city location context (default Tehran or from user profile)
  const [activeCity, setActiveCity] = useState<string>(() => {
    return localStorage.getItem('maalto_user_city') || userProfile?.city || 'تهران';
  });

  React.useEffect(() => {
    if (userProfile?.city) {
      setActiveCity(userProfile.city);
      localStorage.setItem('maalto_user_city', userProfile.city);
    }
  }, [userProfile?.city]);

  const userDistrict = userProfile?.district || 'همه محله‌ها';
  const userLocationLabel = `${activeCity} • ${userDistrict}`;

  // Home Feed items: Prioritizes newest items from the user's city
  const homeCityItems = React.useMemo(() => {
    const activeCityTrim = activeCity.trim();
    return firestoreItems
      .filter((item) => {
        const itemCity = (item.city || '').trim();
        const matchesCity =
          itemCity === activeCityTrim ||
          (item.location && item.location.includes(activeCityTrim)) ||
          (!itemCity && activeCityTrim === 'تهران');
        return matchesCity;
      })
      .sort((a, b) => {
        const timeA = new Date((a as any).createdAt || 0).getTime();
        const timeB = new Date((b as any).createdAt || 0).getTime();
        return timeB - timeA; // newest first
      });
  }, [firestoreItems, activeCity]);

  // Featured Item dynamically derived from the newest item in user's city
  const heroSourceItem = homeCityItems.length > 0 ? homeCityItems[0] : firestoreItems[0];
  const featuredItem: HeroCardData = heroSourceItem ? {
    id: heroSourceItem.id,
    title: heroSourceItem.title,
    description: heroSourceItem.description,
    condition: heroSourceItem.condition,
    timeAgo: heroSourceItem.timeAgo || 'امروز',
    imageUrl: heroSourceItem.imageUrl,
    donorName: heroSourceItem.donorName,
    city: heroSourceItem.location || `${heroSourceItem.city} / ${heroSourceItem.district}`,
  } : {
    id: 'hero-fallback',
    title: 'دوچرخه در حد نو سایز ۲۶',
    description: 'کاملاً سالم و کم‌کارکرد، اهدای رایگان به دانش‌آموز یا فرد علاقه‌مند به ورزش.',
    condition: 'سالم',
    timeAgo: 'امروز',
    imageUrl: './images/items/hero-bike.jpg',
    donorName: 'محمدرضا کاظمی',
    city: `${activeCity} / مرکز شهر`,
  };

  // Donation Feed Items matching the Figma design & expanded free items
  const [donationItems, setDonationItems] = useState<DonationFeedItem[]>([
    {
      id: 'feed-baby-clothes',
      title: 'لباس و سرهمی نوزادی',
      description: 'چند دست سرهمی و پاپوش کاملاً نو و سالم، جنس نخ پنبه ضد حساسیت.',
      condition: 'سالم',
      timeAgo: 'دیروز',
      imageUrl: './images/items/baby-clothes-app.jpg',
      donorName: 'سارا رادمهر',
      location: 'تهران / شهرک غرب',
    },
    {
      id: 'feed-desk',
      title: 'میز مطالعه و تحریر چوبی تاشو',
      description: 'میز کار چوبی سبک با پایه‌های فلزی مقاوم، مناسب اتاق خواب و مطالعه.',
      condition: 'در حد نو',
      timeAgo: 'امروز',
      imageUrl: './images/items/study-table.jpg',
      donorName: 'امیرحسین پارسا',
      location: 'تهران / سعادت‌آباد',
    },
    {
      id: 'feed-books',
      title: 'مجموعه کتاب‌های رمان و داستان‌های کلاسیک',
      description: '۱۲ جلد کتاب نفیس ادبیات فارسی و رمان‌های مطرح جهان با صحافی تمیز.',
      condition: 'سالم',
      timeAgo: '۲ روز پیش',
      imageUrl: './images/items/books-app.jpg',
      donorName: 'دکتر بهرامی',
      location: 'تهران / پونک',
    },
    {
      id: 'feed-guitar',
      title: 'گیتار کلاسیک یاماها مدل C40',
      description: 'ساز تمیز همراه با کاور ضدآب، اهدای رایگان به هنرجوی مبتدی موسیقی.',
      condition: 'سالم',
      timeAgo: '۳ روز پیش',
      imageUrl: './images/items/tennis-racket.jpg',
      donorName: 'نیما علیزاده',
      location: 'تهران / ستارخان',
    },
    {
      id: 'feed-plant',
      title: 'گلدان سانسوریا ابلق بزرگ همراه با پایه',
      description: 'گیاه آپارتمانی شاداب و تصفیه‌کننده هوا با خاک تقویت‌شده و گلدان سرامیکی.',
      condition: 'کاملاً نو',
      timeAgo: 'دیروز',
      imageUrl: './images/items/plant-app.jpg',
      donorName: 'مهشید رضوی',
      location: 'تهران / صادقیه',
    },
  ]);

  // Categories list directly from centralized config
  const categories = CATEGORIES_CONFIG.map((c) => ({
    id: c.id,
    label: c.feedLabel,
  }));

  // Toggle Direction (RTL/LTR)
  const toggleDirection = () => {
    const nextDir = dir === 'rtl' ? 'ltr' : 'rtl';
    setDir(nextDir);
    document.documentElement.setAttribute('dir', nextDir);
    document.documentElement.setAttribute('lang', nextDir === 'rtl' ? 'fa' : 'en');
  };

  // Filtered donation items for Home Feed (search & category within user's city)
  const filteredDonations = React.useMemo(() => {
    return homeCityItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [homeCityItems, searchQuery, activeCategory]);

  // Progressive pagination state for Home Feed
  const [feedDisplayCount, setFeedDisplayCount] = useState<number>(8);

  // Reset pagination count on search, category, or city change
  React.useEffect(() => {
    setFeedDisplayCount(8);
  }, [searchQuery, activeCategory, activeCity]);

  // Paginated Home Feed donations - strictly sourced from filteredDonations (user city, newest first)
  const paginatedDonations = React.useMemo(() => {
    return filteredDonations.slice(0, feedDisplayCount);
  }, [filteredDonations, feedDisplayCount]);

  const hasMoreDonations = feedDisplayCount < filteredDonations.length;

  const handleLoadMore = React.useCallback(() => {
    setFeedDisplayCount((prev) => Math.min(prev + 8, filteredDonations.length));
  }, [filteredDonations.length]);

  // Infinite scrolling sentinel ref
  const feedSentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!feedSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreDonations) {
          handleLoadMore();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(feedSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMoreDonations, handleLoadMore]);

  // Open item detail with internal view count tracking (Firestore atomic + optimistic local state)
  const handleOpenItemDetail = (item: ExploreItem) => {
    if (item.id) {
      incrementItemViews(item.id);
      setFirestoreItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, viewsCount: (it.viewsCount || 0) + 1 } : it))
      );
    }
    setSelectedDetailItem(item);
  };

  // User-owned items in the database
  const myDonatedItems = firestoreItems.filter(
    (item) =>
      Boolean(
        (userProfile?.uid || currentUser?.uid) &&
        (item as any).donorId &&
        (item as any).donorId === (userProfile?.uid || currentUser?.uid)
      )
  );

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
          ? './images/items/baby-clothes-app.jpg'
          : newItem.category === 'کتاب'
          ? './images/items/books-app.jpg'
          : './images/items/study-table.jpg',
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
      {/* Floating Action / Feedback Toast */}
      {requestToast && (
        <div className="fixed top-5 inset-inline-end-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
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
                  setFirestoreItems((prev) => [createdItem, ...prev]);
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
                allItems={firestoreItems}
                onBack={() => setSelectedDetailItem(null)}
                onSelectRelatedItem={(item) => handleOpenItemDetail(item)}
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
                  {/* Feed Header with welcome greeting, notification bell & login door icons */}
                  <FeedHeader
                    greeting={APP_CONFIG.greeting}
                    location={userLocationLabel}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    unreadCount={realUnreadNotifsCount}
                    isAuthenticated={!!currentUser}
                    onNotificationClick={() => {
                      setIsAddItemOpen(false);
                      setSelectedDetailItem(null);
                      setMobileTab('messages');
                    }}
                    onLoginClick={() => setIsAuthModalOpen(true)}
                  />

                  {/* Golden Rule Notice for Free Donation */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-xs text-[#334155]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span className="font-semibold text-[#0F172A]">{APP_CONFIG.goldenRuleNotice}</span>
                    </div>
                    <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-medium">
                      {APP_CONFIG.goldenRuleSub}
                    </span>
                  </div>

                  {/* Featured Hero Card from Figma */}
                  <section>
                    <HeroCard
                      data={featuredItem}
                      onClick={() => {
                        if (heroSourceItem) {
                          handleOpenItemDetail(heroSourceItem);
                        }
                      }}
                    />
                  </section>

                  {/* Feed List Header */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#0F172A]">
                        جدیدترین‌های {activeCity}
                      </h2>
                      <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full font-medium">
                        شهر شما
                      </span>
                    </div>
                    <span className="text-xs text-[#64748B] font-num">
                      {toPersianDigits(filteredDonations.length)} مورد موجود
                    </span>
                  </div>

                  {/* Feed List Cards directly matching Figma */}
                  <div className="flex flex-col gap-3">
                    {isLoadingItems ? (
                      Array.from({ length: 3 }).map((_, idx) => (
                        <DonationFeedCardSkeleton key={idx} />
                      ))
                    ) : itemsError ? (
                      <ErrorState
                        title="خطا در دریافت هدایای اهدایی"
                        message="ارتباط با پایگاه داده هدایا برقرار نشد. لطفاً اتصال خود را بررسی فرمایید."
                        onRetry={() => window.location.reload()}
                      />
                    ) : filteredDonations.length > 0 ? (
                      <>
                        {paginatedDonations.map((item) => (
                          <DonationFeedCard
                            key={item.id}
                            item={item}
                            onClick={() => {
                              handleOpenItemDetail(item);
                            }}
                          />
                        ))}
                        {hasMoreDonations && (
                          <div
                            ref={feedSentinelRef}
                            className="pt-2 pb-4 flex flex-col items-center justify-center gap-2"
                          >
                            <button
                              type="button"
                              onClick={handleLoadMore}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <span>بارگذاری موارد بیشتر در {activeCity}</span>
                              <span className="text-[11px] text-[#3B82F6] font-num">
                                ({toPersianDigits(filteredDonations.length - feedDisplayCount)} مورد دیگر)
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <EmptyState
                        title={`موردی در ${activeCity} یافت نشد`}
                        description={
                          searchQuery
                            ? `هیچ هدیه‌ای با عبارت «${searchQuery}» در ${activeCity} پیدا نشد.`
                            : `در حال حاضر در شهر ${activeCity} در این دسته‌بندی هدیه‌ای ثبت نشده است. می‌توانید در بخش کاوش هدایای سایر شهرها را مشاهده فرمایید.`
                        }
                        actionLabel="مشاهده کاوش (همه شهرها)"
                        onAction={() => {
                          setSearchQuery('');
                          setActiveCategory('all');
                          setMobileTab('explore');
                        }}
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
                    isLoading={isLoadingItems}
                    error={itemsError}
                    onSelectItem={(item) => {
                      handleOpenItemDetail(item);
                    }}
                    onRequestDonation={(item) => {
                      handleOpenItemDetail(item);
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

                  {/* USER-OWNED ITEMS SECTION (کالاهای اهدایی من) */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col gap-4 text-start">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift size={18} className="text-[#2563EB]" />
                        <h3 className="text-sm font-bold text-[#0F172A]">کالاهای اهدایی من</h3>
                      </div>
                      <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 rounded-full font-bold font-num border border-[#BFDBFE]">
                        {toPersianDigits(myDonatedItems.length)} کالا
                      </span>
                    </div>

                    {!currentUser ? (
                      <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center flex flex-col items-center gap-3">
                        <p className="text-xs text-[#64748B]">برای مشاهده و مدیریت کالاهایی که اهدا کرده‌اید وارد شوید.</p>
                        <Button variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                          ورود به حساب کاربری
                        </Button>
                      </div>
                    ) : myDonatedItems.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center flex flex-col items-center gap-3">
                        <p className="text-xs text-[#64748B]">شما هنوز هدیه‌ای برای اهدای رایگان ثبت نکرده‌اید.</p>
                        <Button
                          variant="primary"
                          size="sm"
                          startIcon={<Plus size={14} />}
                          onClick={() => setIsAddItemOpen(true)}
                        >
                          ثبت اولین هدیه برای اهدا
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {myDonatedItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] transition-all flex flex-col gap-2.5"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="text-xs font-bold text-[#0F172A] truncate">{item.title}</h4>
                                  <Badge
                                    variant={
                                      (item as any).status === 'given'
                                        ? 'neutral'
                                        : (item as any).status === 'reserved'
                                        ? 'warning'
                                        : 'success'
                                    }
                                    size="sm"
                                  >
                                    {(item as any).status === 'given'
                                      ? 'اهدا شد'
                                      : (item as any).status === 'reserved'
                                      ? 'رزرو شده'
                                      : 'موجود برای اهدا'}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{item.categoryLabel}</p>
                                <div className="flex items-center gap-3 text-[10px] text-[#94A3B8] mt-1 font-num">
                                  <span className="flex items-center gap-1 text-[#2563EB] font-bold">
                                    <MessageSquare size={12} />
                                    <span>{toPersianDigits(item.requestsCount)} متقاضی</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                              <button
                                type="button"
                                onClick={() => handleOpenItemDetail(item)}
                                className="text-xs text-[#2563EB] hover:underline px-2 py-1 font-medium cursor-pointer"
                              >
                                مشاهده
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const newStatus = (item as any).status === 'given' ? 'available' : 'given';
                                  await updateItem(item.id, { status: newStatus });
                                  setRequestToast(
                                    newStatus === 'given'
                                      ? 'وضعیت کالا به «اهدا شد» تغییر یافت.'
                                      : 'کالا مجدداً به عنوان «موجود برای اهدا» فعال شد.'
                                  );
                                  setTimeout(() => setRequestToast(null), 3000);
                                }}
                                className="text-xs bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] px-2.5 py-1 rounded-lg font-medium cursor-pointer"
                              >
                                {(item as any).status === 'given' ? 'فعال‌سازی مجدد' : 'ثبت واگذاری (اهدا شد)'}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm('آیا از حذف این هدیه از پایگاه داده مالتو اطمینان دارید؟')) {
                                    await deleteItem(item.id);
                                    setRequestToast('هدیه با موفقیت حذف شد.');
                                    setTimeout(() => setRequestToast(null), 3000);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف هدیه"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DEPLOYMENT & SYSTEM HEALTH STATUS */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] flex flex-col gap-2.5 text-start text-xs text-[#64748B]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#334155] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        وضعیت اتصال سرور و پایگاه داده (Cloud Run & Firestore)
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold font-num border border-emerald-200">
                        {backendHealth ? 'سالم و متصل' : 'آماده به کار'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#E2E8F0]">
                      <div>
                        <span className="text-[#94A3B8]">سرور بک‌اند:</span>{' '}
                        <span className="text-[#0F172A] font-medium font-num">Express (Port 3000)</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">پایگاه داده:</span>{' '}
                        <span className="text-[#0F172A] font-medium font-num">Firestore Enterprise</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">احراز هویت:</span>{' '}
                        <span className="text-[#0F172A] font-medium font-num">Firebase Auth</span>
                      </div>
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
            messageBadgeCount={realTotalBadgeCount}
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
