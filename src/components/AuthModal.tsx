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
  AlertCircle,
  MapPin,
  UserPlus,
  LogIn,
  Building2,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  HelpCircle,
} from 'lucide-react';
import {
  IRANIAN_CITIES,
  getDistrictsForCity,
  DEFAULT_CITY,
  DEFAULT_DISTRICT,
} from '../data/locationsData.ts';
import {
  normalizeIranianPhone,
  isValidIranianMobile,
} from '../utils/phoneUtils.ts';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isAuthModalOpen,
    closeAuthModal,
    authPrompt,
    loginWithPhone,
    registerWithPhone,
    sendPasswordReset,
    updateUserProfileData,
    signOut,
    loading,
  } = useAuth();

  // Mode: 'login' | 'register' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ phone?: string; password?: string }>({});

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState(DEFAULT_CITY);
  const [regDistrict, setRegDistrict] = useState(DEFAULT_DISTRICT);
  const [customDistrict, setCustomDistrict] = useState('');
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regBio, setRegBio] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regErrors, setRegErrors] = useState<{
    name?: string;
    phone?: string;
    district?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // General Auth error message
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile completion state (if logged in without district)
  const [needsDistrictCompletion, setNeedsDistrictCompletion] = useState(false);
  const [missingDistrictCity, setMissingDistrictCity] = useState(DEFAULT_CITY);
  const [missingDistrictVal, setMissingDistrictVal] = useState(DEFAULT_DISTRICT);

  // Update district dropdown when registration city changes
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

  // Clear errors when switching tabs
  const switchMode = (mode: 'login' | 'register' | 'forgot-password') => {
    setAuthMode(mode);
    setAuthError(null);
    setLoginErrors({});
    setRegErrors({});
    setResetError(null);
    setResetSuccess(null);
  };

  /**
   * Handle Phone / Email + Password Login
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const errors: { phone?: string; password?: string } = {};
    const trimmedInput = loginPhone.trim();
    const isEmail = trimmedInput.includes('@');
    const normalizedPhone = isEmail ? '' : normalizeIranianPhone(trimmedInput);

    if (!trimmedInput) {
      errors.phone = 'شماره موبایل یا ایمیل الزامی است.';
    } else if (!isEmail && !isValidIranianMobile(normalizedPhone)) {
      errors.phone = 'لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) یا ایمیل وارد کنید.';
    }

    if (!loginPassword) {
      errors.password = 'رمز عبور الزامی است.';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});

    try {
      await loginWithPhone(trimmedInput, loginPassword);
    } catch (err: any) {
      setAuthError(err?.message || 'خطا در ورود به حساب کاربری. لطفاً دوباره امتحان کنید.');
    }
  };

  /**
   * Handle Registration Submit with Required Phone, City, District, Password and Confirm Password
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const finalDistrict = isOtherDistrict ? customDistrict.trim() : regDistrict.trim();
    const normalizedPhone = normalizeIranianPhone(regPhone);

    const errors: {
      name?: string;
      phone?: string;
      district?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // 1. Full name validation
    if (!regName.trim()) {
      errors.name = 'نام و نام خانوادگی الزامی است.';
    } else if (regName.trim().length < 3) {
      errors.name = 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.';
    }

    // 2. Phone number validation (REQUIRED)
    if (!regPhone.trim()) {
      errors.phone = 'شماره موبایل الزامی است.';
    } else if (!isValidIranianMobile(normalizedPhone)) {
      errors.phone = 'شماره موبایل معتبر نیست. لطفاً یک شماره ۱۱ رقمی با ۰۹ (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد فرمایید.';
    }

    // 3. District validation (REQUIRED)
    if (!finalDistrict) {
      errors.district = 'انتخاب یا ثبت محله سکونت الزامی است.';
    }

    // 4. Password validation (REQUIRED)
    if (!regPassword) {
      errors.password = 'رمز عبور الزامی است.';
    } else if (regPassword.length < 6) {
      errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
    }

    // 5. Confirm password validation (REQUIRED & MATCH)
    if (!regConfirmPassword) {
      errors.confirmPassword = 'تکرار رمز عبور الزامی است.';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'تکرار رمز عبور با رمز عبور وارد شده مطابقت ندارد.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setRegErrors({});

    try {
      await registerWithPhone({
        displayName: regName.trim(),
        phoneNumber: normalizedPhone,
        password: regPassword,
        city: regCity,
        district: finalDistrict,
        bio: regBio.trim() || undefined,
        email: regEmail.trim() || undefined,
      });
    } catch (err: any) {
      setAuthError(err?.message || 'مشکلی در ثبت‌نام پیش آمد. لطفاً دوباره بررسی کنید.');
    }
  };

  /**
   * Handle Forgot Password Email Reset
   */
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('لطفاً یک آدرس ایمیل معتبر وارد فرمایید.');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSuccess(
        'پیوند بازیابی رمز عبور با موفقیت به ایمیل شما ارسال شد. لطفاً صندوق ورودی و پوشه هرزنامه (Spam) را بررسی فرمایید.'
      );
    } catch (err: any) {
      setResetError(err?.message || 'ارسال ایمیل بازیابی با خطا مواجه شد. لطفاً دوباره بررسی فرمایید.');
    } finally {
      setIsSendingReset(false);
    }
  };

  /**
   * Handle Missing District Update
   */
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
              {authMode === 'forgot-password'
                ? 'بازیابی رمز عبور'
                : authMode === 'register'
                ? 'ثبت‌نام کاربر جدید در مالتو'
                : promptConfig.title || 'ورود به حساب کاربری مالتو'}
            </h2>
            <p className="text-[11px] text-[#64748B]">
              {authMode === 'forgot-password'
                ? 'راهنمای دسترسی به حساب کاربری'
                : authMode === 'register'
                ? 'اهدای رایگان و بدون قیمت برای هم‌محله‌ای‌ها'
                : promptConfig.description || 'شبکه اهدای ۱۰۰٪ رایگان کالا بین همسایگان'}
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
                  <strong>اقدام نیازمند حساب:</strong> برای ثبت کالای اهدایی و مشخص بودن محله تحویل برای همسایگان، لطفاً وارد حساب خود شوید.
                </span>
              )}
              {promptConfig.actionType === 'request_item' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای ارسال درخواست دریافت و هماهنگی با اهداکننده، ثبت مشخصات و شماره تماس الزامی است.
                </span>
              )}
              {promptConfig.actionType === 'manage_content' && (
                <span>
                  <strong>اقدام نیازمند حساب:</strong> برای مشاهده پیام‌ها، اعلان‌ها و پیگیری هدایا، لطفاً وارد حساب شوید.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {authError && (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 1: USER IS ALREADY LOGGED IN */}
        {/* ========================================================================= */}
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#2563EB]" />
                      <span>
                        {userProfile?.city || 'تهران'} / {userProfile?.district || 'شهرک غرب'}
                      </span>
                    </span>
                    {userProfile?.phoneNumber && (
                      <span className="flex items-center gap-1 font-mono" dir="ltr">
                        <Phone size={12} className="text-[#64748B]" />
                        <span>{userProfile.phoneNumber}</span>
                      </span>
                    )}
                  </div>
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
          /* ========================================================================= */
          /* CASE 2: AUTH FORMS (LOGIN / SIGN UP / FORGOT PASSWORD) */
          /* ========================================================================= */
          <div className="flex flex-col gap-3">
            {/* Mode Switcher Tabs (Only visible when NOT in forgot password mode) */}
            {authMode !== 'forgot-password' && (
              <div className="flex p-1 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0] mb-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-[#2563EB] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <LogIn size={15} />
                  <span>ورود به حساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-[#2563EB] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>ثبت‌نام کاربر جدید</span>
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 1: LOGIN (PHONE + PASSWORD) */}
            {/* ------------------------------------------------------------------ */}
            {authMode === 'login' && (
              <div className="flex flex-col gap-3.5">
                {/* Phone + Password Login Form */}
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col gap-3">
                    {/* Phone Number Field */}
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        شماره موبایل <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={loginPhone}
                          onChange={(e) => {
                            setLoginPhone(e.target.value);
                            if (loginErrors.phone) setLoginErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          dir="ltr"
                          error={loginErrors.phone}
                          className="h-10 text-xs font-mono pl-9"
                        />
                        <Phone
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-[#0F172A]">
                          رمز عبور <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          placeholder="••••••••"
                          dir="ltr"
                          error={loginErrors.password}
                          className="h-10 text-xs font-mono pl-9 pr-9"
                        />
                        <Lock
                          size={15}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* "Forgot password?" link below password field */}
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => switchMode('forgot-password')}
                          className="text-xs text-[#2563EB] hover:underline font-medium cursor-pointer"
                        >
                          فراموشی رمز عبور؟
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading}
                    startIcon={<LogIn size={16} />}
                    className="w-full font-bold shadow-md shadow-[#2563EB]/20 cursor-pointer"
                  >
                    {loading ? 'در حال ورود...' : 'ورود به حساب کاربری'}
                  </Button>
                </form>

                {/* Bottom Switcher to Sign Up */}
                <div className="text-center pt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
                  <span>هنوز در مالتو عضو نشده‌اید؟ </span>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    ثبت‌نام کاربر جدید
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 2: REGISTRATION (NAME, PHONE, CITY, DISTRICT, PASSWORD, CONFIRM) */}
            {/* ------------------------------------------------------------------ */}
            {authMode === 'register' && (
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
                        if (regErrors.name) setRegErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="مثلاً: مریم احمدی"
                      error={regErrors.name}
                      className="h-10 text-xs"
                    />
                  </div>

                  {/* Phone Number (REQUIRED) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#0F172A]">
                        شماره موبایل <span className="text-red-500 font-bold">* (الزامی)</span>
                      </label>
                    </div>
                    <div className="relative">
                      <Input
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          if (regErrors.phone) setRegErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                        error={regErrors.phone}
                        className="h-10 text-xs font-mono pl-9"
                      />
                      <Phone
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      جهت ورود به حساب و هماهنگی دریافت کالا (بدون پیامک تأیید)
                    </p>
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
                            if (regErrors.district)
                              setRegErrors((prev) => ({ ...prev, district: undefined }));
                          }}
                          placeholder="نام محله خود را بنویسید..."
                          error={regErrors.district}
                          className="h-10 text-xs"
                        />
                      ) : (
                        <div className="relative">
                          <select
                            value={regDistrict}
                            onChange={(e) => {
                              setRegDistrict(e.target.value);
                              if (regErrors.district)
                                setRegErrors((prev) => ({ ...prev, district: undefined }));
                            }}
                            className={`w-full h-10 px-3 pr-8 rounded-xl bg-white border text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer ${
                              regErrors.district ? 'border-red-500 bg-red-50/20' : 'border-[#CBD5E1]'
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

                      {regErrors.district && (
                        <span className="text-[11px] text-red-600 font-medium block mt-1">
                          {regErrors.district}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note about why neighborhood is required */}
                  <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] text-[#1E40AF] flex items-start gap-1.5">
                    <MapPin size={14} className="text-[#2563EB] shrink-0 mt-0.5" />
                    <span>
                      <strong>چرا انتخاب محله الزامی است؟</strong> مالتو یک پلتفرم محله‌محور برای اهدای ۱۰۰٪ رایگان کالا است تا انتقال کالا بین همسایگان نزدیک با کمترین مسافت انجام شود.
                    </span>
                  </div>

                  {/* Password & Confirm Password (REQUIRED) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Password */}
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        رمز عبور <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          placeholder="حداقل ۶ کاراکتر"
                          dir="ltr"
                          error={regErrors.password}
                          className="h-10 text-xs font-mono pl-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                        تکرار رمز عبور <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            if (regErrors.confirmPassword)
                              setRegErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                          }}
                          placeholder="تکرار دقیق رمز عبور"
                          dir="ltr"
                          error={regErrors.confirmPassword}
                          className="h-10 text-xs font-mono pl-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] p-0.5 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Backup Email */}
                  <div>
                    <label className="text-xs font-medium text-[#475569] block mb-1">
                      ایمیل پشتیبان (اختیاری - جهت بازیابی رمز عبور):
                    </label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      className="h-10 text-xs font-mono"
                    />
                  </div>

                  {/* Optional Bio */}
                  <div>
                    <label className="text-xs font-medium text-[#475569] block mb-1">
                      معرفی کوتاه یا انگیزه اهدا (اختیاری):
                    </label>
                    <Input
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="مثلاً: علاقه‌مند به بازیافت و اهدای کتاب و وسایل سالم"
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
                  className="w-full font-bold shadow-md shadow-[#2563EB]/20 cursor-pointer"
                >
                  {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام و عضویت در مالتو'}
                </Button>

                {/* Bottom Switcher to Login */}
                <div className="text-center pt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
                  <span>قبلاً در مالتو حساب داشته‌اید؟ </span>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    ورود به حساب
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* VIEW 3: FORGOT PASSWORD FLOW */}
            {/* ------------------------------------------------------------------ */}
            {authMode === 'forgot-password' && (
              <div className="flex flex-col gap-3.5">
                {/* Back button to return to login */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    <ArrowRight size={15} />
                    <span>بازگشت به صفحه ورود</span>
                  </button>
                </div>

                {/* Clear, honest system notice regarding SMS absence */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
                  <HelpCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>راهنمای بازیابی دسترسی:</strong> به دلیل عدم فعال‌سازی سامانه پیامکی در حال حاضر، کد بازیابی به صورت پیامک ارسال نمی‌شود. می‌توانید از روش‌های زیر برای ورود مجدد یا بازنشانی رمز استفاده فرمایید:
                  </div>
                </div>

                {/* Option 1: Send Password Reset via Email */}
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                    <Mail size={16} className="text-[#2563EB]" />
                    <span>روش اول: ارسال پیوند بازنشانی رمز به ایمیل</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    در صورتی که در هنگام ثبت‌نام، ایمیل پشتیبان وارد کرده‌اید یا ایمیل گوگل متصل دارید، آدرس ایمیل خود را وارد نمایید:
                  </p>

                  <div className="relative">
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError(null);
                        setResetSuccess(null);
                      }}
                      placeholder="example@gmail.com"
                      dir="ltr"
                      className="h-10 text-xs font-mono pl-9"
                    />
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                    />
                  </div>

                  {resetError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-1.5">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-1.5">
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                      <span>{resetSuccess}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSendingReset}
                    className="w-full mt-1 cursor-pointer"
                  >
                    {isSendingReset ? 'در حال ارسال پیوند...' : 'ارسال لینک تغییر رمز به ایمیل'}
                  </Button>
                </form>

                {/* Option 2: Support Contact */}
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-[11px] text-[#1E40AF] leading-relaxed">
                  <strong>نیاز به پشتیبانی اختصاصی دارید؟</strong> در صورت بروز هرگونه مشکل یا عدم دسترسی به حساب، با پشتیبانی جامعه مالتو از طریق ایمیل{' '}
                  <span className="font-mono font-bold" dir="ltr">
                    support@maalto.ir
                  </span>{' '}
                  در ارتباط باشید تا در اسرع وقت راهنمایی شوید.
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
