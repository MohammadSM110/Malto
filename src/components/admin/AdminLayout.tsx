import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Globe,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

export type AdminSection = 'dashboard' | 'users' | 'items';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onNavigateHome,
  onLogout,
  children,
}) => {
  return (
    <div
      id="maltoo-admin-panel"
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-12"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Section Title */}
            <div className="flex items-center gap-4">
              <div
                onClick={onNavigateHome}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="بازگشت به صفحه اصلی مالتو"
              >
                <img
                  src="/logo.png"
                  alt="لوگوی مالتو"
                  className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-200 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 tracking-tight text-base">
                      مالتو
                    </span>
                    <span className="text-slate-300 font-light">/</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                      پنل مدیریت
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">سامانه مرکزی نظارت و گزارش‌گیری</span>
                </div>
              </div>

              {/* Navigation Tabs (Desktop) */}
              <nav className="hidden md:flex items-center gap-1 mr-6 border-r border-slate-200 pr-6">
                <button
                  id="admin-tab-dashboard"
                  onClick={() => onSelectSection('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentSection === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>داشبورد</span>
                </button>

                <button
                  id="admin-tab-users"
                  onClick={() => onSelectSection('users')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentSection === 'users'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>کاربران</span>
                </button>

                <button
                  id="admin-tab-items"
                  onClick={() => onSelectSection('items')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentSection === 'items'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>کالاها</span>
                </button>
              </nav>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>حساب مدیر:</span>
                <span className="font-mono text-emerald-700 font-semibold" dir="ltr">
                  {typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('maalto_admin_user') || 'admin' : 'admin'}
                </span>
              </div>

              <button
                id="admin-view-site-btn"
                onClick={onNavigateHome}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>مشاهده وبسایت مالتو</span>
              </button>

              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                title="خروج از حساب مدیر"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden border-t border-slate-100 bg-slate-50/80 px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => onSelectSection('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSection === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>داشبورد</span>
          </button>

          <button
            onClick={() => onSelectSection('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSection === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>کاربران</span>
          </button>

          <button
            onClick={() => onSelectSection('items')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentSection === 'items'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>کالاها</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200/60"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>وبسایت</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
    </div>
  );
};
