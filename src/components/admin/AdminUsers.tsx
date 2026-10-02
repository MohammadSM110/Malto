import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Clock,
  Package,
  RefreshCw,
  Ban,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  UserX,
  FileText,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import {
  getAllUsersForAdmin,
  subscribeToAdminUsers,
  blockUserForAdmin,
} from '../../lib/firestoreService.ts';
import { UserProfile } from '../../types/backend.ts';

interface AdminUsersProps {
  onSelectItemDonor?: (donorName: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Password & Phone visibility state
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Block modal state
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState<string>('');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Real-time synchronization with Firestore users collection
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToAdminUsers(
      (liveUsers) => {
        setUsers(liveUsers);
        setLoading(false);
        setLastSyncTime(new Date());
      },
      (err) => {
        console.warn('Real-time users listener fallback:', err);
        fetchUsers();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchUsers = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const data = await getAllUsersForAdmin();
      setUsers(data);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Format Persian number
  const toPersianNum = (n: number | string | undefined | null): string => {
    if (n === undefined || n === null) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n
      .toString()
      .replace(/\d/g, (x) => persianDigits[parseInt(x, 10)])
      .replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  };

  // Format Persian Relative Date/Time
  const formatPersianTime = (isoString?: string): string => {
    if (!isoString) return 'نامشخص';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'هم‌اکنون آنلاین';
      if (diffMins < 60) return `${toPersianNum(diffMins)} دقیقه پیش`;
      if (diffHours < 24) return `${toPersianNum(diffHours)} ساعت پیش`;
      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${toPersianNum(diffDays)} روز پیش`;

      return date.toLocaleDateString('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleOpenBlockModal = (user: UserProfile) => {
    setTargetUser(user);
    setBlockReason(
      user.isBlocked
        ? ''
        : 'تخلف از قوانین سامانه اهدای رایگان یا عدم پایبندی به تحویل کالا'
    );
  };

  const handleToggleBlock = async () => {
    if (!targetUser) return;

    setIsSubmittingBlock(true);
    const newBlockedState = !targetUser.isBlocked;
    const targetUid = targetUser.uid;
    const targetName = targetUser.displayName || 'کاربر مالتو';

    try {
      await blockUserForAdmin(targetUid, newBlockedState, blockReason);
      
      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUid
            ? {
                ...u,
                isBlocked: newBlockedState,
                blockedAt: newBlockedState ? new Date().toISOString() : undefined,
                blockedReason: newBlockedState ? blockReason : undefined,
              }
            : u
        )
      );

      setToastMessage({
        type: 'success',
        text: newBlockedState
          ? `حساب کاربری «${targetName}» با موفقیت مسدود گردید.`
          : `مسدودیت حساب کاربری «${targetName}» با موفقیت لغو شد.`,
      });
      setTargetUser(null);
    } catch (err) {
      console.error('Error toggling user block status:', err);
      setToastMessage({
        type: 'error',
        text: 'خطا در ثبت تغییر وضعیت کاربر در پایگاه داده. لطفاً دوباره تلاش نمایید.',
      });
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const togglePasswordVisibility = (uid: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const getUserPassword = (user: UserProfile): { password: string; label: string; isGoogle: boolean } => {
    if (user.accountPassword && user.accountPassword.trim()) {
      return { password: user.accountPassword, label: 'رمز ثبت‌شده', isGoogle: false };
    }
    // If user has a google email and no explicit custom phone password
    if (user.email && (user.email.includes('google') || (user.email.endsWith('@gmail.com') && !user.phoneNumber))) {
      return { password: 'ورود با حساب گوگل', label: 'گوگل', isGoogle: true };
    }
    // For accounts registered with phone or sample accounts without explicit password
    return { password: 'Maalto@123', label: 'رمز پیش‌فرض', isGoogle: false };
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const name = (u.displayName || '').toLowerCase();
      const phone = (u.phoneNumber || '').toLowerCase();
      const pwd = (u.accountPassword || '').toLowerCase();
      const city = (u.city || '').toLowerCase();
      const district = (u.district || '').toLowerCase();
      const matchesSearch =
        !q ||
        name.includes(q) ||
        phone.includes(q) ||
        pwd.includes(q) ||
        city.includes(q) ||
        district.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'blocked' && !!u.isBlocked) ||
        (statusFilter === 'active' && !u.isBlocked);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  return (
    <div id="admin-users-section" className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="admin-users-toast"
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with Search & Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>مدیریت کاربران سامانه</span>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {toPersianNum(users.length)} کاربر در پایگاه داده
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>داده‌های زنده</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            نظارت بر حساب‌های کاربری، مشخصات تماس، فعالیت و امکان مسدودسازی یا رفع مسدودیت کاربران
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="admin-user-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام، شماره، رمز یا شهر..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Toggle All Passwords Visibility */}
          <button
            id="admin-users-toggle-all-passwords-btn"
            onClick={() => setShowAllPasswords((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium border ${
              showAllPasswords
                ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={showAllPasswords ? 'پنهان‌سازی همه رمزهای عبور' : 'نمایش همه رمزهای عبور کاربران'}
          >
            {showAllPasswords ? (
              <EyeOff className="w-4 h-4 text-amber-700" />
            ) : (
              <Eye className="w-4 h-4 text-slate-600" />
            )}
            <span className="hidden sm:inline">
              {showAllPasswords ? 'پنهان‌سازی رمزها' : 'نمایش همه رمزها'}
            </span>
          </button>

          <button
            id="admin-users-refresh-btn"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium border border-slate-200"
            title="به‌روزرسانی فهرست کاربران"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            <span className="hidden sm:inline">به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'همه کاربران', count: users.length },
          {
            id: 'active',
            label: 'کاربران فعال',
            count: users.filter((u) => !u.isBlocked).length,
          },
          {
            id: 'blocked',
            label: 'کاربران مسدودشده',
            count: users.filter((u) => !!u.isBlocked).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`filter-user-tab-${tab.id}`}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {toPersianNum(tab.count)}
            </span>
          </button>
        ))}

        <div className="mr-auto text-[11px] text-slate-400 hidden lg:flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>آخرین همگام‌سازی: {lastSyncTime.toLocaleTimeString('fa-IR')}</span>
        </div>
      </div>

      {/* Users Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
            <span>در حال بارگذاری لحظه‌ای مشخصات کاربران از پایگاه داده فایربیس...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            کاربری با شرایط جستجو و فیلتر انتخابی یافت نشد.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table id="admin-users-table" className="w-full text-right text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-3.5 px-4">کاربر</th>
                    <th className="py-3.5 px-4">شماره تلفن</th>
                    <th className="py-3.5 px-4">رمز عبور</th>
                    <th className="py-3.5 px-4">شهر / منطقه</th>
                    <th className="py-3.5 px-4">آخرین ورود</th>
                    <th className="py-3.5 px-4 text-center">کالاهای ثبت‌شده</th>
                    <th className="py-3.5 px-4 text-center">وضعیت حساب</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isRecent =
                      user.lastLoginAt &&
                      Date.now() - new Date(user.lastLoginAt).getTime() < 30 * 60 * 1000;
                    const isBlocked = !!user.isBlocked;
                    const { password, label, isGoogle } = getUserPassword(user);
                    const isPasswordVisible = showAllPasswords || !!revealedPasswords[user.uid];

                    return (
                      <tr
                        key={user.uid}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          isBlocked ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border flex-shrink-0 ${
                                isBlocked
                                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                                  : 'bg-purple-50 text-purple-700 border-purple-200/60'
                              }`}
                            >
                              {user.displayName ? user.displayName.charAt(0) : 'ک'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{user.displayName || 'کاربر مالتو'}</span>
                                {isRecent && !isBlocked && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                    title="هم‌اکنون آنلاین"
                                  />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                شناسه: {user.uid.slice(0, 12)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone Number */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-slate-800" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold">{user.phoneNumber || 'ثبت نشده'}</span>
                            {user.phoneNumber && (
                              <button
                                onClick={() => handleCopy(user.phoneNumber!, `phone-${user.uid}`)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
                                title="کپی شماره تماس"
                              >
                                {copiedKey === `phone-${user.uid}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3.5 px-4">
                          {isGoogle ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-medium">
                              <ShieldCheck className="w-3 h-3 text-sky-600" />
                              <span>ورود با گوگل</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div
                                dir="ltr"
                                className="font-mono text-xs px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 select-all max-w-[130px] truncate"
                                title={isPasswordVisible ? password : 'برای نمایش رمز کلیک کنید'}
                              >
                                {isPasswordVisible ? password : '••••••••'}
                              </div>
                              <button
                                onClick={() => togglePasswordVisibility(user.uid)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title={isPasswordVisible ? 'پنهان‌سازی رمز' : 'نمایش رمز عبور'}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopy(password, `pwd-${user.uid}`)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="کپی رمز عبور"
                              >
                                {copiedKey === `pwd-${user.uid}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* City & District */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>
                              {user.city || 'تهران'}
                              {user.district ? ` (${user.district})` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Last Login Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span
                              className={
                                isRecent && !isBlocked
                                  ? 'text-emerald-700 font-medium'
                                  : 'text-slate-600'
                              }
                            >
                              {formatPersianTime(user.lastLoginAt)}
                            </span>
                          </div>
                        </td>

                        {/* Items Posted Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              (user.itemsCount || 0) > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            <span>{toPersianNum(user.itemsCount ?? 0)} کالا</span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {isBlocked ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
                              title={user.blockedReason || 'مسدود شده'}
                            >
                              <Ban className="w-3 h-3 text-rose-500" />
                              <span>مسدود شده</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>فعال</span>
                            </span>
                          )}
                        </td>

                        {/* Action: Block / Unblock */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            id={`block-user-btn-${user.uid}`}
                            onClick={() => handleOpenBlockModal(user)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                              isBlocked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>رفع مسدودیت</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>مسدودسازی</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isBlocked = !!user.isBlocked;
                const { password, label, isGoogle } = getUserPassword(user);
                const isPasswordVisible = showAllPasswords || !!revealedPasswords[user.uid];

                return (
                  <div
                    key={user.uid}
                    className={`p-4 space-y-3 ${isBlocked ? 'bg-rose-50/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center border ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-purple-50 text-purple-700 border-purple-200/60'
                          }`}
                        >
                          {user.displayName ? user.displayName.charAt(0) : 'ک'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {user.displayName || 'کاربر مالتو'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.city || 'تهران'} {user.district ? `• ${user.district}` : ''}
                          </div>
                        </div>
                      </div>

                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3 text-rose-500" />
                          <span>مسدود</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Package className="w-3 h-3" />
                          <span>{toPersianNum(user.itemsCount ?? 0)} کالا</span>
                        </span>
                      )}
                    </div>

                    {/* Mobile credentials details */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      {/* Phone */}
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>تلفن:</span>
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-slate-800" dir="ltr">
                          <span className="font-semibold">{user.phoneNumber || 'ثبت نشده'}</span>
                          {user.phoneNumber && (
                            <button
                              onClick={() => handleCopy(user.phoneNumber!, `phone-${user.uid}`)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700"
                              title="کپی شماره تلفن"
                            >
                              {copiedKey === `phone-${user.uid}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span>رمز عبور:</span>
                        </span>
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            <span>ورود با گوگل</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 font-mono text-slate-800" dir="ltr">
                            <span className="font-semibold text-xs">
                              {isPasswordVisible ? password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(user.uid)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700"
                              title={isPasswordVisible ? 'پنهان‌سازی' : 'نمایش'}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(password, `pwd-${user.uid}`)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700"
                              title="کپی رمز"
                            >
                              {copiedKey === `pwd-${user.uid}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{user.city || 'تهران'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatPersianTime(user.lastLoginAt)}</span>
                      </div>
                    </div>

                    {/* Mobile Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleOpenBlockModal(user)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          isBlocked
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>رفع مسدودیت کاربر</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>مسدودسازی کاربر</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Block / Unblock Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="admin-block-user-modal"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-right"
            dir="rtl"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                targetUser.isBlocked
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}
            >
              {targetUser.isBlocked ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {targetUser.isBlocked ? 'رفع مسدودیت کاربر' : 'مسدودسازی حساب کاربر'}
              </h3>
              <p className="text-xs text-slate-500">
                {targetUser.isBlocked
                  ? 'با فعال‌سازی مجدد، این کاربر قادر به ثبت کالای اهدایی و ارسال درخواست خواهد بود.'
                  : 'با مسدودسازی، امکان ثبت کالای جدید یا ارسال درخواست توسط این کاربر مسدود می‌گردد.'}
              </p>
            </div>

            {/* Target User Brief Info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                  {targetUser.displayName ? targetUser.displayName.charAt(0) : 'ک'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {targetUser.displayName || 'کاربر مالتو'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    شهر: {targetUser.city || 'تهران'} {targetUser.district ? `(${targetUser.district})` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                {/* Phone */}
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 mb-1">شماره تلفن:</div>
                  <div className="flex items-center justify-between font-mono text-slate-800" dir="ltr">
                    <span className="font-semibold text-[11px] truncate">
                      {targetUser.phoneNumber || 'ثبت نشده'}
                    </span>
                    {targetUser.phoneNumber && (
                      <button
                        onClick={() => handleCopy(targetUser.phoneNumber!, `modal-phone-${targetUser.uid}`)}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                        title="کپی شماره"
                      >
                        {copiedKey === `modal-phone-${targetUser.uid}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 mb-1">رمز عبور:</div>
                  {(() => {
                    const { password, isGoogle } = getUserPassword(targetUser);
                    const isVisible = showAllPasswords || !!revealedPasswords[targetUser.uid];

                    if (isGoogle) {
                      return (
                        <div className="text-[11px] text-sky-700 font-medium">
                          ورود با گوگل
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-between font-mono text-slate-800" dir="ltr">
                        <span className="font-semibold text-[11px] truncate">
                          {isVisible ? password : '••••••••'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => togglePasswordVisibility(targetUser.uid)}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                            title={isVisible ? 'پنهان‌سازی' : 'نمایش'}
                          >
                            {isVisible ? (
                              <EyeOff className="w-3 h-3 text-amber-600" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(password, `modal-pwd-${targetUser.uid}`)}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                            title="کپی رمز"
                          >
                            {copiedKey === `modal-pwd-${targetUser.uid}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Reason Input (only when blocking) */}
            {!targetUser.isBlocked && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  دلیل مسدودسازی حساب:
                </label>
                <textarea
                  id="block-reason-input"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="علت مسدودسازی را بنویسید (اختیاری)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-colors"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                id="cancel-block-user-btn"
                onClick={() => setTargetUser(null)}
                disabled={isSubmittingBlock}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                id="confirm-block-user-btn"
                onClick={handleToggleBlock}
                disabled={isSubmittingBlock}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                  targetUser.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingBlock ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : targetUser.isBlocked ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>تأیید رفع مسدودیت</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>تأیید مسدودسازی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
