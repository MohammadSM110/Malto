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
