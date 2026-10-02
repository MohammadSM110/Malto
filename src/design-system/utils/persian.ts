/**
 * Persian typography and donation platform helpers for Maalto Design System
 * Strictly free-donation focused; zero commercial/pricing systems.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(value: string | number): string {
  if (value === undefined || value === null) return '';
  const str = value.toString();
  return str.replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)]);
}

/**
 * Converts Persian digits to English digits
 */
export function toEnglishDigits(value: string): string {
  if (!value) return '';
  let str = value;
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
  }
  return str;
}

/**
 * Formats a Persian count or quantity
 */
export function formatPersianCount(count: number): string {
  return toPersianDigits(count);
}

/**
 * Persian relative time indicators matching the Figma design ("دیروز", "امروز", "لحظاتی پیش")
 */
export function formatRelativePersianTime(time: string): string {
  if (!time) return 'دیروز';
  return toPersianDigits(time);
}

/**
 * Formats donation state label
 */
export function getDonationStatusLabel(status: 'available' | 'reserved' | 'donated'): string {
  switch (status) {
    case 'available':
      return 'آماده واگذاری رایگان';
    case 'reserved':
      return 'در حال هماهنگی تحویل';
    case 'donated':
      return 'اهدا شد';
  }
}

/**
 * Accurately calculates elapsed relative time from a creation timestamp
 * Starting from the exact moment an item was submitted by the user.
 * e.g. "همین الان", "۵ دقیقه پیش", "۳ ساعت پیش", "دیروز", "۲ روز پیش", "۱ هفته پیش"
 */
export function formatPersianTimeAgo(dateInput?: string | number | Date): string {
  if (!dateInput) return 'همین الان';
  const timestamp =
    typeof dateInput === 'string' && isNaN(Date.parse(dateInput))
      ? null
      : new Date(dateInput).getTime();

  if (!timestamp || isNaN(timestamp)) {
    if (typeof dateInput === 'string') return toPersianDigits(dateInput);
    return 'همین الان';
  }

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'همین الان';

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return 'همین الان';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'دیروز';
  if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '۱ هفته پیش';
  if (diffWeeks < 4) return `${toPersianDigits(diffWeeks)} هفته پیش`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '۱ ماه پیش';
  if (diffMonths < 12) return `${toPersianDigits(diffMonths)} ماه پیش`;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return '۱ سال پیش';
  return `${toPersianDigits(diffYears)} سال پیش`;
}

