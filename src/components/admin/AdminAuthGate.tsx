import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

interface AdminAuthGateProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
}

export const ADMIN_SESSION_KEY = 'maalto_admin_session_active';
export const ADMIN_TOKEN_KEY = 'maalto_admin_token';
export const ADMIN_USER_KEY = 'maalto_admin_user';

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ children, onNavigateHome }) => {
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify existing session on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      const isActive = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

      if (!isActive) {
        if (isMounted) {
          setIsSessionActive(false);
          setIsVerifying(false);
        }
        return;
      }

      // Check server API endpoint to verify cryptographic signature and expiration
      try {
        if (token) {
          const res = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (res.ok && data.valid && isMounted) {
              setIsSessionActive(true);
              if (data.username) {
                sessionStorage.setItem(ADMIN_USER_KEY, data.username);
              }
            } else if (isMounted) {
              sessionStorage.removeItem(ADMIN_SESSION_KEY);
              sessionStorage.removeItem(ADMIN_TOKEN_KEY);
              sessionStorage.removeItem(ADMIN_USER_KEY);
              setIsSessionActive(false);
            }
          } else if (isMounted) {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            sessionStorage.removeItem(ADMIN_TOKEN_KEY);
            sessionStorage.removeItem(ADMIN_USER_KEY);
            setIsSessionActive(false);
          }
        } else if (isMounted) {
          setIsSessionActive(false);
        }
      } catch (err) {
        console.warn('Admin session verification notice:', err);
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('لطفاً نام کاربری مدیر را وارد کنید.');
      return;
    }
    if (!password) {
      setError('لطفاً رمز عبور مدیر را وارد کنید.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate strictly on the server-side
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: password,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (res.ok && data.success && data.token) {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
          sessionStorage.setItem(ADMIN_USER_KEY, data.username || cleanUsername);
          setIsSessionActive(true);
          setError(null);
          return;
        } else {
          setError(data.error || 'نام کاربری یا رمز عبور وارد شده اشتباه است.');
          return;
        }
      } else {
        setError('پاسخ سرور نامعتبر است. لطفاً وضعیت سرور را بررسی فرمایید.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('امکان برقراری ارتباط با سرور احراز هویت وجود ندارد. لطفاً ارتباط اینترنت خود را بررسی نمایید.');
    } finally {
      setIsLoading(false);
    }
  };

  // While verifying existing session token
  if (isVerifying && isSessionActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span>در حال بررسی اعتبار نشست مدیریت...</span>
        </div>
      </div>
    );
  }

  // If verified and active session
  if (isSessionActive) {
    return <>{children}</>;
  }

  return (
    <div
      id="admin-auth-gate"
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-emerald-500 selection:text-white"
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Emblem */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto mb-4 border border-slate-700 bg-[#0E3058] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="لوگوی مالتو"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.tried) {
                  target.dataset.tried = '1';
                  target.src = '/logo.jpg';
                }
              }}
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>پنل مدیریت مالتو</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ورود اختصاصی به پنل مدیریت
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            این بخش منحصراً در اختیار مدیران سیستم قرار دارد. جهت دسترسی، نام کاربری و رمز عبور معتبر مدیر را وارد کنید.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="admin-unauthorized-alert"
            className="mb-5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dedicated Admin Username + Password Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              نام کاربری مدیر (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="مثلاً: admin"
                dir="ltr"
                autoComplete="username"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              رمز عبور مدیر (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="رمز عبور حساب مدیریت"
                dir="ltr"
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'مخفی‌سازی رمز' : 'نمایش رمز'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-submit-login-btn"
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال بررسی اطلاعات مدیریت...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ورود امن به پنل مدیریت</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Home button */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
          <button
            id="admin-back-to-home-btn"
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>بازگشت به وبسایت اصلی مالتو</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
