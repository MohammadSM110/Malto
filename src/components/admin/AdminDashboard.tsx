import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Eye,
  Package,
  Activity,
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { getDashboardMetrics, DashboardMetrics } from '../../lib/firestoreService.ts';

interface AdminDashboardProps {
  onNavigateToUsers: () => void;
  onNavigateToItems: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToUsers,
  onNavigateToItems,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    dayLabel: string;
    visits: number;
    x: number;
    y: number;
  } | null>(null);

  const loadMetrics = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    loadMetrics();
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => loadMetrics(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Format Persian number
  const toPersianNum = (n: number | string | undefined | null): string => {
    if (n === undefined || n === null) return '۰';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n
      .toString()
      .replace(/\d/g, (x) => persianDigits[parseInt(x, 10)])
      .replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  };

  // SVG Chart Dimensions and calculations
  const chartData = useMemo(() => {
    if (!metrics?.dailyVisitsChart || metrics.dailyVisitsChart.length === 0) {
      return [];
    }
    return metrics.dailyVisitsChart;
  }, [metrics]);

  const chartMetrics = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d) => d.visits);
    const max = Math.max(...values, 50);
    const min = Math.min(...values, 0);
    return { max: Math.ceil(max * 1.15), min: 0 };
  }, [chartData]);

  return (
    <div id="admin-dashboard-section" className="space-y-6">
      {/* Top Banner with live status & refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>داشبورد وضعیت سامانه مالتو</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>داده‌های زنده پایگاه داده</span>
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              نظارت لحظه‌ای بر آمار بازدیدها، کاربران آنلاین، کالاهای ثبت‌شده و حساب‌های کاربری
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500">
          <span className="hidden md:inline">
            آخرین به‌روزرسانی: {lastRefreshed.toLocaleTimeString('fa-IR')}
          </span>
          <button
            id="admin-dashboard-refresh-btn"
            onClick={() => loadMetrics(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Website Visits */}
        <div
          id="stat-card-visits"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">بازدیدهای وبسایت</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {toPersianNum(metrics?.visits.today ?? 0)}
              </div>
              <div className="text-[11px] text-slate-500">بازدید کل امروز</div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">این ماه:</span>
                <span className="font-semibold text-slate-800">
                  {toPersianNum(metrics?.visits.month ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">کل زمان‌ها:</span>
                <span className="font-semibold text-slate-800">
                  {toPersianNum(metrics?.visits.allTime ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Online Users */}
        <div
          id="stat-card-online"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">کاربران آنلاین</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-emerald-700 tracking-tight flex items-center gap-2">
                <span>{toPersianNum(metrics?.onlineUsers.currentlyOnline ?? 1)}</span>
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  فعال لحظه‌ای
                </span>
              </div>
              <div className="text-[11px] text-slate-500">کاربران هم‌اکنون آنلاین</div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">کل کاربران آنلاین امروز:</span>
              <span className="font-semibold text-slate-800">
                {toPersianNum(metrics?.onlineUsers.today ?? 0)} کاربر
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: New Items */}
        <div
          id="stat-card-items"
          onClick={onNavigateToItems}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">کالاهای اهدایی</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {toPersianNum(metrics?.items.today ?? 0)}
              </div>
              <div className="text-[11px] text-slate-500">کالای جدید ثبت‌شده امروز</div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">این ماه:</span>
                <span className="font-semibold text-slate-800">
                  {toPersianNum(metrics?.items.month ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">کل کالاها:</span>
                <span className="font-semibold text-slate-800">
                  {toPersianNum(metrics?.items.allTime ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: New Users / Logged In */}
        <div
          id="stat-card-users"
          onClick={onNavigateToUsers}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">کاربران سامانه</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {toPersianNum(metrics?.users.loggedInToday ?? 0)}
              </div>
              <div className="text-[11px] text-slate-500">کاربران واردشده امروز</div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">کل کاربران عضو سامانه:</span>
              <span className="font-semibold text-slate-800">
                {toPersianNum(metrics?.users.totalUsers ?? 0)} حساب
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Daily Visits Chart Section */}
      <div
        id="admin-daily-visits-chart-card"
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>نمودار بازدیدهای روزانه وبسایت</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              روند تغییرات ترافیک و مراجعات روزانه کاربران به وبسایت مالتو در ۱۴ روز گذشته
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>تعداد بازدید روزانه</span>
            </div>
            {chartMetrics && (
              <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                حداکثر: {toPersianNum(chartMetrics.max)}
              </span>
            )}
          </div>
        </div>

        {/* Interactive SVG Bar & Line Chart */}
        <div className="relative w-full h-64 sm:h-72">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              در حال دریافت داده‌های بازدید از پایگاه داده فایربیس...
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-end">
              {/* Bar Chart Visualization */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-48 sm:h-52 px-2 border-b border-slate-200">
                {chartData.map((item, index) => {
                  const maxVal = chartMetrics?.max || 300;
                  const heightPercent = Math.max(12, Math.round((item.visits / maxVal) * 100));
                  const isToday = index === chartData.length - 1;

                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredPoint({
                          date: item.date,
                          dayLabel: item.dayLabel,
                          visits: item.visits,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 z-20 pointer-events-none bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                        <span className="font-bold">{toPersianNum(item.visits)}</span> بازدید
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm shadow-emerald-500/30'
                            : 'bg-emerald-100 group-hover:bg-emerald-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between gap-1.5 sm:gap-3 mt-2 px-2 text-[10px] sm:text-xs text-slate-400">
                {chartData.map((item, index) => {
                  const isToday = index === chartData.length - 1;
                  return (
                    <div
                      key={item.date}
                      className={`flex-1 text-center truncate ${
                        isToday ? 'font-bold text-emerald-700' : ''
                      }`}
                      title={`${item.dayLabel} (${item.date})`}
                    >
                      {isToday ? 'امروز' : item.dayLabel.split(' ')[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={onNavigateToUsers}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                مدیریت و فهرست کاربران وارد شده
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                مشاهده اسامی، شماره تماس، شهر و تعداد کالاهای ثبت‌شده هر کاربر
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div
          onClick={onNavigateToItems}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                مدیریت و فهرست کالاهای ثبت‌شده
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                بررسی کالاهای جدید، دسته‌بندی، موقعیت مکانی و وضعیت تحویل
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
};
