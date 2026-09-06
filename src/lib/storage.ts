import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.ts';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate an image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'فرمت تصویر نامعتبر است. لطفاً فایل PNG، JPG یا WEBP انتخاب کنید.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'حجم تصویر نباید بیش از ۱۰ مگابایت باشد.',
    };
  }

  return { valid: true };
}

/**
 * Compress and convert an image file to an optimized data URL
 * Used as reliable fallback if cloud storage is unreachable
 */
export async function fileToOptimizedDataUrl(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('خطا در بارگذاری فایل تصویر'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an item photo to Firebase Storage with intelligent fallback
 */
export async function uploadItemPhoto(
  file: File,
  itemId: string,
  index = 0
): Promise<{ url: string; storageType: 'cloud' | 'local' }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'فایل نامعتبر است');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `items/${itemId}/${Date.now()}_${index}_${sanitizedName}`;
  const storageRef = ref(storage, path);

  try {
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        itemId,
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return { url: downloadUrl, storageType: 'cloud' };
  } catch (storageErr) {
    console.warn(
      'Firebase Storage cloud upload encountered an issue, falling back to client-optimized image asset:',
      storageErr
    );
    const localDataUrl = await fileToOptimizedDataUrl(file);
    return { url: localDataUrl, storageType: 'local' };
  }
}
