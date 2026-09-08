import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  subscribeDonorRequests,
  subscribeUserRequests,
  subscribeNotifications,
  updateRequestStatus,
  markNotificationAsRead,
} from '../lib/firestoreService.ts';
import { ItemRequestDoc, NotificationDoc } from '../types/backend.ts';
import { Button } from '../design-system/components/Button.tsx';
import { Badge } from '../design-system/components/Badge.tsx';
import {
  MessageSquare,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Inbox,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import { toPersianDigits } from '../design-system/utils/persian.ts';

export const RequestsManager: React.FC<{
  onExploreClick: () => void;
  onRequestSelected?: (itemTitle: string) => void;
}> = ({ onExploreClick }) => {
  const { currentUser, userProfile, requireAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'notifications'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<ItemRequestDoc[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ItemRequestDoc[]>([]);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const currentUserId = userProfile?.uid || currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to requests received as a donor
    const unsubDonor = subscribeDonorRequests(currentUserId, (list) => {
      setIncomingRequests(list);
      setLoading(false);
    });

    // Subscribe to requests sent as a requester
    const unsubUser = subscribeUserRequests(currentUserId, (list) => {
      setOutgoingRequests(list);
      setLoading(false);
    });

    // Subscribe to notifications
    const unsubNotifs = subscribeNotifications(currentUserId, (list) => {
      setNotifications(list);
    });

    return () => {
      unsubDonor();
      unsubUser();
      unsubNotifs();
    };
  }, [currentUserId]);

  const handleStatusChange = async (
    requestId: string,
    status: 'accepted' | 'declined',
    requesterId: string,
    itemTitle: string
  ) => {
    try {
      await updateRequestStatus(requestId, status, requesterId, itemTitle);
      setActionSuccessToast(
        status === 'accepted'
          ? `درخواست برای «${itemTitle}» با موفقیت تایید شد. پیام به متقاضی ارسال گردید.`
          : `درخواست برای «${itemTitle}» رد شد.`
      );
      setTimeout(() => setActionSuccessToast(null), 4000);
    } catch (e: any) {
      console.error('Update status error:', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!currentUserId) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={24} />
        </div>
        <h2 className="text-base font-bold text-[#0F172A] mb-1">گفتگو و درخواست‌های اهدای کالا</h2>
        <p className="text-xs text-[#64748B] leading-relaxed mb-5">
          برای مشاهده درخواست‌های دریافتی، پیگیری هدیه‌های درخواستی و هماهنگی تحویل حضوری، لطفاً وارد حساب خود شوید.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() =>
            requireAuth({
              title: 'ورود به بخش پیام‌ها و درخواست‌ها',
              description: 'برای مشاهده درخواست‌های دریافتی و پیگیری هدایا، لطفاً وارد شوید.',
              actionType: 'manage_content',
              onAuthenticated: () => {},
            })
          }
        >
          ورود به حساب کاربری
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-start">
      {/* Toast Alert */}
      {actionSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-[#F1F5F9] rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Inbox size={14} />
          <span>درخواست‌های دریافتی</span>
          {incomingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-num font-bold flex items-center justify-center">
              {toPersianDigits(incomingRequests.length)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'outgoing'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Send size={14} />
          <span>درخواست‌های من</span>
          {outgoingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-num font-bold flex items-center justify-center">
              {toPersianDigits(outgoingRequests.length)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Bell size={14} />
          <span>اعلان‌ها</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-num font-bold flex items-center justify-center">
              {toPersianDigits(unreadCount)}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INCOMING REQUESTS FOR MY DONATED ITEMS */}
      {activeTab === 'incoming' && (
        <div className="flex flex-col gap-3">
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
                <Inbox size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">درخواست دریافتی جدیدی ندارید</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                هنگامی که کاربران جامعه برای کالاهای اهدایی شما درخواست ثبت کنند، پیام آنها در اینجا نمایش داده خواهد شد.
              </p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">{req.itemTitle}</span>
                    <span className="text-[11px] text-[#64748B]">از طرف: {req.requesterName}</span>
                  </div>
                  <Badge
                    variant={
                      req.status === 'accepted'
                        ? 'success'
                        : req.status === 'declined'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {req.status === 'accepted'
                      ? 'تایید شده'
                      : req.status === 'declined'
                      ? 'رد شده'
                      : 'در انتظار پاسخ'}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs text-[#334155] leading-relaxed">
                  <p>«{req.message}»</p>
                </div>

                {req.pickupOption && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Truck size={13} className="text-[#2563EB]" />
                    <span>شیوه تحویل پیشنهادی: {req.pickupOption === 'pickup' ? 'تحویل حضوری' : 'ارسال پیک'}</span>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(req.id, 'accepted', req.requesterId, req.itemTitle)
                      }
                      startIcon={<Check size={14} />}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      تایید و اهدا به این متقاضی
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStatusChange(req.id, 'declined', req.requesterId, req.itemTitle)
                      }
                      startIcon={<X size={14} />}
                      className="text-slate-500 hover:bg-slate-50"
                    >
                      رد درخواست
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: OUTGOING REQUESTS (SENT BY USER) */}
      {activeTab === 'outgoing' && (
        <div className="flex flex-col gap-3">
          {outgoingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
                <Send size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">هنوز درخواستی ارسال نکرده‌اید</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                کالاهای اهدایی ۱۰۰٪ رایگان را در بخش کاوش بررسی کنید و برای اقلام مورد نیاز درخواست دهید.
              </p>
              <Button variant="primary" size="sm" onClick={onExploreClick}>
                مشاهده کالاهای بخش کاوش
              </Button>
            </div>
          ) : (
            outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{req.itemTitle}</h4>
                    <span className="text-[11px] text-[#64748B]">اهداکننده: {req.donorName}</span>
                  </div>
                  <Badge
                    variant={
                      req.status === 'accepted'
                        ? 'success'
                        : req.status === 'declined'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {req.status === 'accepted'
                      ? 'هدیه تایید شد'
                      : req.status === 'declined'
                      ? 'رد شد'
                      : 'در انتظار بررسی'}
                  </Badge>
                </div>

                <p className="text-xs text-[#475569] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#F1F5F9]">
                  پیام شما: {req.message}
                </p>

                {req.status === 'accepted' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <HeartHandshake size={14} className="text-emerald-600 shrink-0" />
                    <span>اهداکننده با درخواست شما موافقت کرد. می‌توانید جهت تحویل حضوری اقدام کنید.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="flex flex-col gap-2.5">
          {unreadCount > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-[#64748B]">
                {toPersianDigits(unreadCount)} اعلان خوانده‌نشده
              </span>
              <button
                type="button"
                onClick={async () => {
                  const unread = notifications.filter((n) => !n.read);
                  for (const n of unread) {
                    await markNotificationAsRead(n.id);
                  }
                }}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                علامت‌گذاری همه به عنوان خوانده‌شده
              </button>
            </div>
          )}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
                <Bell size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">اعلان جدیدی وجود ندارد</h3>
              <p className="text-xs text-[#64748B]">
                پیام‌ها و وضعیت درخواست‌های شما در این قسمت اطلاع‌رسانی می‌شوند.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-[#E2E8F0] opacity-80'
                    : 'bg-[#EFF6FF] border-[#BFDBFE] shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                    {n.title}
                  </span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">{n.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
