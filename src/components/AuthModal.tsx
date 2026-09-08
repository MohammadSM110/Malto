import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Modal } from '../design-system/components/Modal.tsx';
import { Button } from '../design-system/components/Button.tsx';
import { Input } from '../design-system/components/Input.tsx';
import {
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  LogOut,
  Sparkles,
  AlertCircle,
  MapPin,
  UserPlus,
  LogIn,
  Building2,
} from 'lucide-react';
import {
  IRAN_CITIES_DATA,
  IRANIAN_CITIES,
  getDistrictsForCity,
  DEFAULT_CITY,
  DEFAULT_DISTRICT,
} from '../data/locationsData.ts';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isAuthModalOpen,
    closeAuthModal,
    authPrompt,
    signInWithGoogle,
    signInAsDemoUser,
    registerUser,
    updateUserProfileData,
    signOut,
    loading,
  } = useAuth();

  // Tab State: 'register' vs 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regCity, setRegCity] = useState(DEFAULT_CITY);
  const [regDistrict, setRegDistrict] = useState(DEFAULT_DISTRICT);
  const [customDistrict, setCustomDistrict] = useState('');
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [regEmailOrPhone, setRegEmailOrPhone] = useState('');
  const [regBio, setRegBio] = useState('');
  const [errors, setErrors] = useState<{ name?: string; district?: string }>({});

  // Login quick form state
  const [demoName, setDemoName] = useState('محمدرضا کاظمی');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile completion state (if logged in without district)
  const [needsDistrictCompletion, setNeedsDistrictCompletion] = useState(false);
  const [missingDistrictCity, setMissingDistrictCity] = useState(DEFAULT_CITY);
  const [missingDistrictVal, setMissingDistrictVal] = useState(DEFAULT_DISTRICT);

  // Update district dropdown when city changes
  useEffect(() => {
    const districts = getDistrictsForCity(regCity);
    if (districts.length > 0) {
      setRegDistrict(districts[0]);
      setIsOtherDistrict(false);
    }
  }, [regCity]);

  // Check if current user profile is missing district
  useEffect(() => {
    if (userProfile && (!userProfile.district || userProfile.district.trim() === '')) {
      setNeedsDistrictCompletion(true);
      setMissingDistrictCity(userProfile.city || DEFAULT_CITY);
    } else {
      setNeedsDistrictCompletion(false);
    }
  }, [userProfile]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const finalDistrict = isOtherDistrict ? customDistrict.trim() : regDistrict.trim();

    // Validation
    const newErrors: { name?: string; district?: string } = {};
    if (!regName.trim()) {
      newErrors.name = 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
    }
    if (!finalDistrict) {
      newErrors.district = 'انتخاب محله سکونت الزامی است.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await registerUser({
        displayName: regName.trim(),
        city: regCity,
        district: finalDistrict,
        bio: regBio.trim() || undefined,
        email: regEmailOrPhone.trim() || undefined,
      });
    } catch (err: any) {
      setAuthError(err?.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleSaveMissingDistrict = async () => {
    if (!missingDistrictVal.trim()) {
      return;
    }
    try {
      await updateUserProfileData({
        city: missingDistrictCity,
        district: missingDistrictVal.trim(),
      });
      setNeedsDistrictCompletion(false);
    } catch (err) {
      console.error('Failed to update district:', err);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(
        'ورود با گوگل نیاز به پنجره بازشو (Popup) دارد یا لغو شد. می‌توانید از فرم ثبت‌نام یا ورود تستی در زیر استفاده کنید.'
      );
    }
  };

  const handleDemoLogin = async (nameToUse: string, districtToUse = 'شهرک غرب', cityToUse = 'تهران') => {
    setAuthError(null);
    try {
      await signInAsDemoUser(nameToUse, districtToUse, cityToUse);
    } catch (err: any) {
      setAuthError(err?.message || 'خطا در ورود تستی');
    }
  };

  const promptConfig = authPrompt || {
    isOpen: false,
    title: 'حساب کاربری مالتو',
    description: 'پلتفرم ۱۰۰٪ رایگان اهدای کالا بدون قیمت و خرید/فروش',
    actionType: 'general',
  };

  const currentDistricts = getDistrictsForCity(regCity);
  const completionDistricts = getDistrictsForCity(missingDistrictCity);

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
      title={
        <div className="flex items-center gap-3 text-start">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-xs shrink-0">
            <HeartHandshake size={22} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#0F172A]">
              {promptConfig.title || 'عضویت در جامعه مالتو'}
            </h2>
            <p className="text-[11px] text-[#64748B]">
              {promptConfig.description || 'اهدای رایگان و بدون قیمت برای هم‌محله‌ای‌ها'}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col text-start">
        {/* Context badge if triggered by a protected action */}
        {promptConfig.actionType && promptConfig.actionType !== 'general' && (
          <div className="mb-4 p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF] flex items-start gap-2">
            <ShieldCheck size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {promptConfig.actionType === 'create_giveaway' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای ثبت کالای اهدایی و مشخص بودن محله تحویل برای همسایگان، لطفاً نام و محله خود را ثبت کنید.
                </span>
              )}
              {promptConfig.actionType === 'request_item' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای ارسال درخواست دریافت و پیام به اهداکننده، ثبت مشخصات و محله الزامی است.
                </span>
              )}
              {promptConfig.actionType === 'manage_content' && (
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
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white font-bold flex items-center justify-center text-base shadow-xs">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'م'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                    <span>{userProfile?.displayName || 'کاربر مالتو'}</span>
                    <span className="text-[10px] text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full font-medium">
                      متصل
                    </span>
                  </h4>
                  <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-[#2563EB]" />
                    <span>
                      {userProfile?.city || 'تهران'} / {userProfile?.district || 'شهرک غرب'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt to complete required district if missing */}
            {needsDistrictCompletion && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>محله سکونت شما ثبت نشده است!</strong> برای هماهنگی صحیح تحویل رایگان کالا، انتخاب محله الزامی است:
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                      شهر:
                    </label>
                    <select
                      value={missingDistrictCity}
                      onChange={(e) => {
                        setMissingDistrictCity(e.target.value);
                        const dists = getDistrictsForCity(e.target.value);
                        if (dists.length > 0) setMissingDistrictVal(dists[0]);
                      }}
                      className="w-full h-9 px-2 rounded-xl bg-white border border-amber-300 text-xs"
                    >
                      {IRANIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                      محله (الزامی): *
                    </label>
                    <select
                      value={missingDistrictVal}
                      onChange={(e) => setMissingDistrictVal(e.target.value)}
                      className="w-full h-9 px-2 rounded-xl bg-white border border-amber-300 text-xs"
                    >
                      {completionDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveMissingDistrict}
                  className="w-full mt-1"
                >
                  ذخیره و تایید محله
                </Button>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>شما عضو فعال مالتو هستید.</strong> اکنون می‌توانید بدون محدودیت کالا ثبت کنید، درخواست دریافت ارسال کنید و با هم‌محله‌ای‌ها هماهنگ شوید.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={closeAuthModal}
                className="flex-1"
              >
                بازگشت به برنامه
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={signOut}
                startIcon={<LogOut size={14} />}
                className="flex-1"
              >
                خروج از حساب
              </Button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Forms */
          <div className="flex flex-col gap-3">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0] mb-1">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <UserPlus size={15} />
                <span>ثبت‌نام کاربر جدید (الزام محله)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <LogIn size={15} />
                <span>ورود سریع / حساب گوگل</span>
              </button>
            </div>

            {authMode === 'register' ? (
              /* REGISTRATION FORM WITH REQUIRED NEIGHBORHOOD */
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col gap-3">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      نام و نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="مثلاً: مریم احمدی"
                      error={errors.name}
                      className="h-10 text-xs"
                    />
                  </div>

                  {/* City & Neighborhood (Required) Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* City Selection */}
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        انتخاب شهر: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          className="w-full h-10 px-3 pr-8 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                        >
                          {IRANIAN_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <Building2
                          size={15}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Neighborhood Selection (REQUIRED) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                          <span>انتخاب محله:</span>
                          <span className="text-red-500 font-bold">* (الزامی)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsOtherDistrict(!isOtherDistrict)}
                          className="text-[10px] text-[#2563EB] hover:underline cursor-pointer"
                        >
                          {isOtherDistrict ? 'انتخاب از لیست' : 'محله دیگر؟'}
                        </button>
                      </div>

                      {isOtherDistrict ? (
                        <Input
                          value={customDistrict}
                          onChange={(e) => {
                            setCustomDistrict(e.target.value);
                            if (errors.district)
                              setErrors((prev) => ({ ...prev, district: undefined }));
                          }}
                          placeholder="نام محله خود را بنویسید..."
                          error={errors.district}
                          className="h-10 text-xs"
                        />
                      ) : (
                        <div className="relative">
                          <select
                            value={regDistrict}
                            onChange={(e) => {
                              setRegDistrict(e.target.value);
                              if (errors.district)
                                setErrors((prev) => ({ ...prev, district: undefined }));
                            }}
                            className={`w-full h-10 px-3 pr-8 rounded-xl bg-white border text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer ${
                              errors.district ? 'border-red-500 bg-red-50/20' : 'border-[#CBD5E1]'
                            }`}
                          >
                            {currentDistricts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <MapPin
                            size={15}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2563EB] pointer-events-none"
                          />
                        </div>
                      )}

                      {errors.district && (
                        <span className="text-[11px] text-red-600 font-medium block mt-1">
                          {errors.district}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note about why neighborhood is required */}
                  <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] text-[#1E40AF] flex items-start gap-1.5">
                    <MapPin size={14} className="text-[#2563EB] shrink-0 mt-0.5" />
                    <span>
                      <strong>چرا انتخاب محله الزامی است؟</strong> مالتو یک پلتفرم محله‌محور برای اهدای ۱۰۰٪ رایگان کالا است تا انتقال کالا بین همسایگان نزدیک با کمترین مسافت و هزینه انجام شود.
                    </span>
                  </div>

                  {/* Optional Email or Mobile */}
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      شماره موبایل یا ایمیل (اختیاری جهت هماهنگی):
                    </label>
                    <Input
                      value={regEmailOrPhone}
                      onChange={(e) => setRegEmailOrPhone(e.target.value)}
                      placeholder="مثلاً: 0912... یا ایمیل"
                      className="h-10 text-xs font-mono"
                    />
                  </div>

                  {/* Optional Bio */}
                  <div>
                    <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                      معرفی کوتاه یا انگیزه اهدا (اختیاری):
                    </label>
                    <Input
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="مثلاً: علاقه‌مند به گردش کالا و کمک به خانواده‌ها"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  startIcon={<UserPlus size={16} />}
                  className="w-full font-bold shadow-md shadow-[#2563EB]/20"
                >
                  {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام و عضویت در مالتو'}
                </Button>
              </form>
            ) : (
              /* LOGIN TAB: GOOGLE & DEMO PROFILES */
              <div className="flex flex-col gap-3">
                {/* One-click Google Login */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F172A] text-xs font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>ورود با حساب گوگل (Google Sign-In)</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#E2E8F0]"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-[#94A3B8]">
                    یا ورود سریع با پروفایل‌های محلی آزمایشی
                  </span>
                  <div className="flex-grow border-t border-[#E2E8F0]"></div>
                </div>

                {/* Quick Demo Profiles */}
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('محمدرضا کاظمی', 'شهرک غرب', 'تهران')}
                      className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-start transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-xs font-bold shrink-0">
                          م
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-[#0F172A] block truncate group-hover:text-[#2563EB]">
                            محمدرضا کاظمی
                          </span>
                          <span className="text-[10px] text-[#64748B] flex items-center gap-0.5">
                            <MapPin size={10} className="text-[#2563EB]" />
                            تهران، شهرک غرب
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoLogin('زهرا سلیمانی', 'مرداویج', 'اصفهان')}
                      className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-start transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-xs font-bold shrink-0">
                          ز
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-[#0F172A] block truncate group-hover:text-[#2563EB]">
                            زهرا سلیمانی
                          </span>
                          <span className="text-[10px] text-[#64748B] flex items-center gap-0.5">
                            <MapPin size={10} className="text-[#16A34A]" />
                            اصفهان، مرداویج
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Demo Name Input */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#475569]">
                    یا نام و محله دلخواه خود را وارد کنید:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="نام و نام خانوادگی..."
                      className="h-9 text-xs flex-1"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDemoLogin(demoName, regDistrict, regCity)}
                      disabled={loading}
                      startIcon={<Sparkles size={14} />}
                      className="shrink-0"
                    >
                      ورود
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
    </Modal>
  );
};
