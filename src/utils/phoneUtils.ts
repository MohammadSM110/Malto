/**
 * Utility functions for Iranian mobile phone normalization, validation, and internal Auth mapping.
 */

/**
 * Normalizes Persian and Arabic digits to standard ASCII English digits.
 */
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

/**
 * Normalizes an Iranian mobile phone number to standard 11-digit format (09xxxxxxxxx).
 * Handles:
 * - Persian/Arabic digits
 * - Leading '+98' or '0098' or '98'
 * - Leading '9' with 10 digits
 * - Spaces, dashes, and parenthetical separators
 */
export function normalizeIranianPhone(raw: string): string {
  if (!raw) return '';
  let cleaned = toEnglishDigits(raw).replace(/[^\d]/g, '');

  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('98') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Validates whether the given string is a valid Iranian mobile number (09xxxxxxxxx, exactly 11 digits).
 */
export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizeIranianPhone(phone);
  return /^09\d{9}$/.test(normalized);
}

/**
 * Converts a normalized phone number to an internal deterministic email for Firebase Auth.
 * Example: '09123456789' -> '09123456789@users.maalto.ir'
 */
export function phoneToInternalEmail(phone: string): string {
  const normalized = normalizeIranianPhone(phone);
  return `${normalized}@users.maalto.ir`;
}
