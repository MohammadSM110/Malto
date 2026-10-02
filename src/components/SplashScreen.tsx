import React, { useEffect, useState } from 'react';

export interface SplashScreenProps {
  onFinish?: () => void;
  minDisplayTimeMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDisplayTimeMs = 2400,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep splash screen visible for at least minDisplayTimeMs
    const timer = setTimeout(() => {
      setIsFading(true);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onFinish?.();
      }, 700); // 700ms smooth fade-out
      return () => clearTimeout(exitTimer);
    }, minDisplayTimeMs);

    return () => clearTimeout(timer);
  }, [minDisplayTimeMs, onFinish]);

  const handleSkip = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <div
      id="app-splash-screen"
      role="dialog"
      aria-label="صفحه خوش‌آمدگویی مالتو"
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer select-none text-white transition-opacity duration-700 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#0E3058' }}
    >
      {/* Decorative ambient lighting glow behind logo */}
      <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      {/* Centered Content: App Logo positioned in the middle of the screen */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-lg w-full text-center">
        {/* App Logo: Pure logo with smooth rounded corners, zero white corners */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[22%] overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="لوگوی مالتو"
              className="w-full h-full object-contain rounded-[22%]"
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
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm font-persian">
          مالتو
        </h1>

        {/* Tagline Text below the logo */}
        <p className="text-lg sm:text-xl md:text-2xl font-medium text-white/95 leading-relaxed tracking-normal max-w-sm sm:max-w-md drop-shadow-sm font-persian">
          اینجا یک دیوار مهربانی بزرگه
        </p>

        {/* 100% Free Indicator badge */}
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold backdrop-blur-xs">
          <span>اهدای ۱۰۰٪ رایگان و بدون معامله تجاری</span>
        </div>

        {/* Subtle loading dots */}
        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Subtle skip hint at bottom */}
      <div className="absolute bottom-5 text-[11px] text-white/40 tracking-wide font-light">
        برای ورود سریع ضربه بزنید
      </div>
    </div>
  );
};
