import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  MapPin,
  Calendar,
  Tag,
  RefreshCw,
  Clock,
  Check,
  AlertTriangle,
  Trash2,
  Eye,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import {
  getAllItemsForAdmin,
  subscribeToAdminItems,
  updateItemStatusForAdmin,
  deleteItemForAdmin,
} from '../../lib/firestoreService.ts';
import { GiveawayItemDoc, ItemStatus } from '../../types/backend.ts';

export const AdminItems: React.FC = () => {
  const [items, setItems] = useState<GiveawayItemDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<GiveawayItemDoc | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<GiveawayItemDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Real-time synchronization with Firestore items
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToAdminItems(
      (liveItems) => {
        setItems(liveItems);
        setLoading(false);
        setLastSyncTime(new Date());
      },
      (err) => {
        console.warn('Real-time items listener error, falling back to manual fetch:', err);
        fetchItems();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchItems = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const data = await getAllItemsForAdmin();
      setItems(data);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error fetching admin items:', err);
    } finally {
      setLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  // Auto-hide toast after 4 seconds
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

  // Format Persian Date
  const formatPersianDate = (isoString?: string): string => {
    if (!isoString) return 'نامشخص';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    setUpdatingItemId(itemId);
    try {
      await updateItemStatusForAdmin(itemId, newStatus);
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
      );
      setToastMessage({
        type: 'success',
        text: `وضعیت کالا به «${
          newStatus === 'available' ? 'موجود' : newStatus === 'reserved' ? 'رزرو شده' : 'اهدا شده'
        }» تغییر یافت.`,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setToastMessage({
        type: 'error',
        text: 'خطا در تغییر وضعیت کالا. لطفاً مجدداً تلاش کنید.',
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Open modal to confirm deletion
  const requestDeleteItem = (item: GiveawayItemDoc) => {
    setItemToDelete(item);
  };

  // Execute deletion from Firestore
  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const targetTitle = itemToDelete.title;
    const targetId = itemToDelete.id;

    try {
      await deleteItemForAdmin(targetId);
      // Immediately filter out locally
      setItems((prev) => prev.filter((it) => it.id !== targetId));
      setToastMessage({
        type: 'success',
        text: `کالای «${targetTitle}» با موفقیت از پایگاه داده مالتو حذف شد.`,
      });
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item from admin panel:', err);
      setToastMessage({
        type: 'error',
        text: 'خطا در حذف کالا از پایگاه داده. لطفاً دوباره تلاش نمایید.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.categoryLabel || item.category || '').toLowerCase().includes(q) ||
        (item.city || '').toLowerCase().includes(q) ||
        (item.donorName || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>موجود</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>رزرو شده</span>
          </span>
        );
      case 'given':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Check className="w-3 h-3" />
            <span>اهدا شده</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
            نامشخص
          </span>
        );
    }
  };

  return (
    <div id="admin-items-section" className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="admin-items-toast"
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

      {/* Header with Search, Filter & Live Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>مدیریت کالاهای اهدایی</span>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {toPersianNum(items.length)} کالا در پایگاه داده
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>همگام‌سازی لحظه‌ای</span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مشاهده، جستجو، تغییر وضعیت و امکان حذف مستقیم کالاها از پایگاه داده به صورت واقعی
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="admin-item-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، دسته، شهر یا اهداکننده..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            id="admin-items-refresh-btn"
            onClick={() => fetchItems(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
            title="به‌روزرسانی فهرست کالاها"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span className="hidden sm:inline">به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'همه کالاها', count: items.length },
          {
            id: 'available',
            label: 'موجود برای اهدا',
            count: items.filter((i) => i.status === 'available').length,
          },
          {
            id: 'reserved',
            label: 'رزرو شده',
            count: items.filter((i) => i.status === 'reserved').length,
          },
          {
            id: 'given',
            label: 'اهدا شده',
            count: items.filter((i) => i.status === 'given').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
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

      {/* Items Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            <span>در حال بارگذاری لحظه‌ای فهرست کالاها از پایگاه داده فایربیس...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            کالایی با شرایط جستجو و فیلتر انتخابی یافت نشد.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table id="admin-items-table" className="w-full text-right text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-3.5 px-4">کالا</th>
                    <th className="py-3.5 px-4">دسته‌بندی</th>
                    <th className="py-3.5 px-4">شهر و محله</th>
                    <th className="py-3.5 px-4">تاریخ ثبت</th>
                    <th className="py-3.5 px-4 text-center">وضعیت</th>
                    <th className="py-3.5 px-4 text-center">تغییر وضعیت</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const isUpdating = updatingItemId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Title & Image */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 relative group">
                              <img
                                src={item.imageUrl || '/images/items/default-item.jpg'}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    '/images/items/default-item.jpg';
                                }}
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <div className="font-semibold text-slate-900 truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                اهداکننده: {item.donorName || 'جامعه مالتو'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{item.categoryLabel || item.category || 'عمومی'}</span>
                          </span>
                        </td>

                        {/* City */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>
                              {item.city || 'تهران'}
                              {item.district ? ` / ${item.district}` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Creation Date */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatPersianDate(item.createdAt)}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Status Switcher Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                              onClick={() => handleStatusChange(item.id, 'available')}
                              disabled={isUpdating || item.status === 'available'}
                              title="تغییر وضعیت به موجود"
                              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                item.status === 'available'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              موجود
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'reserved')}
                              disabled={isUpdating || item.status === 'reserved'}
                              title="تغییر وضعیت به رزرو شده"
                              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                item.status === 'reserved'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              رزرو
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, 'given')}
                              disabled={isUpdating || item.status === 'given'}
                              title="تغییر وضعیت به اهدا شده"
                              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                item.status === 'given'
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              اهدا
                            </button>
                          </div>
                        </td>

                        {/* Actions: View Details & Delete */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`preview-item-btn-${item.id}`}
                              onClick={() => setPreviewItem(item)}
                              title="مشاهده جزئیات کالا"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-item-btn-${item.id}`}
                              onClick={() => requestDeleteItem(item)}
                              title="حذف کامل کالا از پایگاه داده"
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img
                        src={item.imageUrl || '/images/items/default-item.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/items/default-item.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                          {item.title}
                        </h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{item.categoryLabel || item.category || 'عمومی'}</span>
                        <span>•</span>
                        <span>{item.city || 'تهران'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        ثبت: {formatPersianDate(item.createdAt)} | اهداکننده:{' '}
                        {item.donorName || 'کاربر مالتو'}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status on Mobile */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => handleStatusChange(item.id, 'available')}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === 'available' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        موجود
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'reserved')}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === 'reserved' ? 'bg-amber-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        رزرو
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'given')}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          item.status === 'given' ? 'bg-slate-700 text-white' : 'text-slate-600'
                        }`}
                      >
                        اهدا
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>جزئیات</span>
                      </button>
                      <button
                        onClick={() => requestDeleteItem(item)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف کالا</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="admin-delete-item-modal"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-right"
            dir="rtl"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                حذف کالا از پایگاه داده
              </h3>
              <p className="text-xs text-slate-500">
                آیا از حذف دائم این کالا از سامانه مالتو اطمینان دارید؟
              </p>
            </div>

            {/* Target Item Brief Info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                <img
                  src={itemToDelete.imageUrl || '/images/items/default-item.jpg'}
                  alt={itemToDelete.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {itemToDelete.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  شهر: {itemToDelete.city} | اهداکننده: {itemToDelete.donorName}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                توجه: این اقدام غیرقابل بازگشت است و کالا فوراً از صفحه اصلی، کاوش و دیتابیس حذف خواهد شد.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="cancel-delete-item-btn"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                id="confirm-delete-item-btn"
                onClick={confirmDeleteItem}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تأیید و حذف دائم</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="admin-preview-item-modal"
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span>مشاهده مشخصات کامل کالا</span>
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={previewItem.imageUrl || '/images/items/default-item.jpg'}
                  alt={previewItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{previewItem.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(previewItem.status)}
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-600">
                    {previewItem.categoryLabel || previewItem.category}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-600">وضعیت فیزیکی: {previewItem.condition}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-2">
                <div className="text-slate-700 leading-relaxed font-normal">
                  {previewItem.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">موقعیت:</span>
                  <span className="font-medium text-slate-800">
                    {previewItem.city} / {previewItem.district}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">روش تحویل:</span>
                  <span className="font-medium text-slate-800">
                    {previewItem.deliveryLabel || previewItem.deliveryMethod}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">اهداکننده:</span>
                  <span className="font-medium text-slate-800">{previewItem.donorName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">تاریخ ثبت:</span>
                  <span className="font-medium text-slate-800">
                    {formatPersianDate(previewItem.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    requestDeleteItem(item);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف این کالا</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
