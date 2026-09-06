import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../design-system/components/Button.tsx';
import { Input } from '../design-system/components/Input.tsx';
import {
  X,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  LogIn,
  LogOut,
  Sparkles,
  User,
  AlertCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isAuthModalOpen,
    closeAuthModal,
    authPrompt,
    signInWithGoogle,
    signInAsDemoUser,
    signOut,
    loading,
  } = useAuth();

  const [demoName, setDemoName] = useState('محمدرضا کاظمی');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(
        'ورود با گوگل نیاز به پنجره بازشو (Popup) دارد یا لغو شد. می‌توانید از ورود سریع تستی در کادر زیر استفاده کنید.'
      );
    }
  };

  const handleDemoLogin = async (nameToUse?: string) => {
    setAuthError(null);
    try {
      const chosenName = nameToUse || demoName.trim() || 'اهداکننده مالتو';
      await signInAsDemoUser(chosenName);
    } catch (err: any) {
      setAuthError(err?.message || 'خطا در ورود تستی');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl relative text-start animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="بستن پنجره"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-xs">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {authPrompt.title || 'حساب کاربری مالتو'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {authPrompt.description || 'پلتفرم ۱۰۰٪ رایگان اهدای کالا بدون قیمت و خرید/فروش'}
            </p>
          </div>
        </div>

        {/* Context badge if triggered by a protected action */}
        {authPrompt.actionType && authPrompt.actionType !== 'general' && (
          <div className="mb-4 p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] flex items-start gap-2">
            <ShieldCheck size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {authPrompt.actionType === 'create_giveaway' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای ثبت کالای اهدایی و ارتباط با متقاضیان جهت تحویل رایگان، لطفاً وارد شوید.
                </span>
              )}
              {authPrompt.actionType === 'request_item' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای ارسال درخواست دریافت این هدیه و پیام به اهداکننده، لطفاً وارد شوید.
                </span>
              )}
              {authPrompt.actionType === 'manage_content' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای مشاهده پیام‌ها، اعلان‌ها و پیگیری هدایا، لطفاً وارد شوید.
                </span>
              )}
            </div>
          </div>
        )}

        {authError && (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* If user is already logged in */}
        {userProfile || currentUser ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'م'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0F172A] text-sm">
                    {userProfile?.displayName || 'کاربر مالتو'}
                  </span>
                  <CheckCircle2 size={14} className="text-[#16A34A]" />
                </div>
                <span className="text-xs text-[#64748B] block">
                  {userProfile?.email || currentUser?.email || 'شناسه کاربری تایید شده'}
                </span>
                <span className="text-[11px] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full inline-block mt-1">
                  {userProfile?.district || 'شهرک غرب'} / {userProfile?.city || 'تهران'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#F1F5F9] text-[#475569]">
                <span className="font-bold text-[#2563EB] block text-base font-num">
                  {userProfile?.donatedCount ?? 0}
                </span>
                <span>کالای اهدا شده</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F1F5F9] text-[#475569]">
                <span className="font-bold text-[#16A34A] block text-base font-num">
                  {userProfile?.receivedCount ?? 0}
                </span>
                <span>هدیه دریافت شده</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                startIcon={<LogOut size={14} />}
                className="w-full text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                خروج از حساب
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={closeAuthModal}
                className="w-full"
              >
                بستن پنجره
              </Button>
            </div>
          </div>
        ) : (
          /* Sign-in options */
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed">
              <p className="font-medium text-[#0F172A] mb-1">مرور آزادانه بدون نیاز به ورود:</p>
              شما می‌توانید بدون ثبت‌نام تمامی هدایای مالتو را جستجو و بررسی کنید. فقط برای ثبت هدیه یا درخواست نیاز به ورود است.
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-sm flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer transition-all hover:border-[#94A3B8]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ورود مستقیم با حساب گوگل (Firebase Auth)</span>
            </button>

            <div className="flex items-center gap-2 my-0.5">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[11px] text-[#94A3B8]">یا ورود سریع تستی</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            {/* Quick Demo Profiles selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#475569]">
                انتخاب حساب تستی سریع:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('محمدرضا کاظمی')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#0F172A] font-medium transition-all text-start cursor-pointer flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    م
                  </div>
                  <span className="truncate">محمدرضا کاظمی</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('سارا رادمهر')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#0F172A] font-medium transition-all text-start cursor-pointer flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    س
                  </div>
                  <span className="truncate">سارا رادمهر</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="نام سفارشی دلخواه..."
                  className="text-xs"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleDemoLogin()}
                  disabled={loading}
                  startIcon={<Sparkles size={15} />}
                  className="shrink-0"
                >
                  ورود
                </Button>
              </div>
            </div>

            {/* Dismiss CTA to continue anonymous browsing freely */}
            <div className="pt-2 border-t border-[#F1F5F9] text-center">
              <button
                type="button"
                onClick={closeAuthModal}
                className="text-xs text-[#64748B] hover:text-[#0F172A] font-medium underline underline-offset-4 cursor-pointer"
              >
                انصراف و ادامه مرور آزادانه اقلام (کاربر مهمان)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
