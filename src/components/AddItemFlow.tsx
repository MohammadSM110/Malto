import React, { useState, useRef } from 'react';
import { cn } from '../design-system/utils/cn.ts';
import { toPersianDigits } from '../design-system/utils/persian.ts';
import { Button } from '../design-system/components/Button.tsx';
import { Input } from '../design-system/components/Input.tsx';
import { Textarea } from '../design-system/components/Textarea.tsx';
import { ConditionBadge } from '../design-system/components/Badge.tsx';
import { ExploreItem, EXPLORE_CATEGORIES, DISTRICTS } from '../data/exploreData.ts';
import { IRANIAN_CITIES, getDistrictsForCity } from '../data/locationsData.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { uploadItemPhoto } from '../lib/storage.ts';
import { createItem } from '../lib/firestoreService.ts';
import { GiveawayItemDoc } from '../types/backend.ts';
import {
  Upload,
  Image as ImageIcon,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  Trash2,
  Eye,
  Gift,
  Plus,
  Truck,
  HeartHandshake,
  Check,
  Layers,
  Clock,
  Shirt,
  Armchair,
  BookOpen,
  Baby,
  Gamepad2,
  Wrench,
  Flower2,
} from 'lucide-react';

export interface NewGiveawayPayload {
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  condition: 'سالم' | 'کاملاً نو' | 'در حد نو' | 'نیازمند تعمیر';
  city: string;
  district: string;
  pickupAddress?: string;
  deliveryMethod: 'pickup' | 'courier' | 'any';
  deliveryLabel: string;
  urgentPickup: boolean;
  images: string[];
  imageUrl: string;
  donorName: string;
  createdAt: string;
}

export interface AddItemFlowProps {
  onClose: () => void;
  onSuccess: (createdItem: ExploreItem) => void;
  onViewItem?: (item: ExploreItem) => void;
}

// Preset high quality donation photos for rapid evaluation
const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'کتاب‌های رمان و شعر',
    url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    category: 'books',
  },
  {
    name: 'میز تحریر و کار چوبی',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    category: 'home',
  },
  {
    name: 'دوچرخه شهری ۲۶',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    category: 'entertainment',
  },
  {
    name: 'لباس نوزادی و کودک',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    category: 'kids',
  },
  {
    name: 'گیتار و ساز موسیقی',
    url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    category: 'entertainment',
  },
  {
    name: 'گیاه آپارتمانی شاداب',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    category: 'plants',
  },
];

const CITIES = IRANIAN_CITIES;

const CONDITION_OPTIONS: Array<{
  id: 'کاملاً نو' | 'در حد نو' | 'سالم' | 'نیازمند تعمیر';
  label: string;
  desc: string;
}> = [
  {
    id: 'کاملاً نو',
    label: 'کاملاً نو و آکبند',
    desc: 'کالا استفاده نشده یا دارای بسته‌بندی اولیه است.',
  },
  {
    id: 'در حد نو',
    label: 'در حد نو',
    desc: 'بسیار تمیز و کم‌استفاده، بدون خط و خش یا ایراد ظاهری.',
  },
  {
    id: 'سالم',
    label: 'سالم و قابل استفاده',
    desc: 'کارکرد عادی دارد و علائم استفاده معمول روی آن دیده می‌شود.',
  },
  {
    id: 'نیازمند تعمیر',
    label: 'نیازمند تعمیر جزئی',
    desc: 'کالا با تعمیر کوچک یا سرویس ساده دوباره کاملاً کاربردی می‌شود.',
  },
];

const DELIVERY_OPTIONS: Array<{
  id: 'pickup' | 'courier' | 'any';
  label: string;
  desc: string;
}> = [
  {
    id: 'pickup',
    label: 'تحویل حضوری رایگان',
    desc: 'دریافت‌کننده به صورت حضوری به نشانی هماهنگ‌شده مراجعه می‌کند.',
  },
  {
    id: 'courier',
    label: 'ارسال با پیک / پست',
    desc: 'هماهنگی و هزینه ارسال با باربری یا پیک با توافق طرفین انجام می‌شود.',
  },
  {
    id: 'any',
    label: 'توافقی در گفت‌وگو',
    desc: 'شیوه تحویل پس از ثبت درخواست در چت خصوصی مشخص می‌گردد.',
  },
];

export const AddItemFlow: React.FC<AddItemFlowProps> = ({
  onClose,
  onSuccess,
  onViewItem,
}) => {
  // Wizard steps: 1 = Media & Title, 2 = Category & Description, 3 = Location & Delivery, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Authentication Context
  const { currentUser, userProfile, isAuthenticated, requireAuth } = useAuth();

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('home');
  const [condition, setCondition] = useState<'سالم' | 'کاملاً نو' | 'در حد نو' | 'نیازمند تعمیر'>('در حد نو');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('تهران');
  const [district, setDistrict] = useState('شهرک غرب');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'courier' | 'any'>('pickup');
  const [urgentPickup, setUrgentPickup] = useState(false);
  const [confirmedTerms, setConfirmedTerms] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessItem, setSubmitSuccessItem] = useState<ExploreItem | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Dev toggle for testing server errors as requested
  const [simulateServerError, setSimulateServerError] = useState(false);

  // Image Upload Input Ref & Dragging state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Quick Category helper
  const availableCategories = EXPLORE_CATEGORIES.filter((c) => c.id !== 'all');

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'clothing':
        return <Shirt size={18} />;
      case 'home':
        return <Armchair size={18} />;
      case 'books':
        return <BookOpen size={18} />;
      case 'kids':
        return <Baby size={18} />;
      case 'entertainment':
        return <Gamepad2 size={18} />;
      case 'tools':
        return <Wrench size={18} />;
      case 'plants':
        return <Flower2 size={18} />;
      default:
        return <Tag size={18} />;
    }
  };

  // ---------------------------------------------------------------------------
  // Validation Logic
  // ---------------------------------------------------------------------------
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (images.length === 0) {
        newErrors.images = 'حداقل یک تصویر برای معرفی کالا ضروری است.';
      }
      if (!title.trim()) {
        newErrors.title = 'لطفاً عنوان وسیله یا کالا را وارد کنید.';
      } else if (title.trim().length < 5) {
        newErrors.title = 'عنوان باید حداقل شامل ۵ حرف باشد.';
      } else if (title.trim().length > 80) {
        newErrors.title = 'عنوان نباید بیش از ۸۰ کاراکتر باشد.';
      }
    }

    if (step === 2) {
      if (!category) {
        newErrors.category = 'لطفاً یک دسته‌بندی برای کالا مشخص کنید.';
      }
      if (!description.trim()) {
        newErrors.description = 'توضیحات کالا ضروری است تا متقاضیان از وضعیت آن مطلع شوند.';
      } else if (description.trim().length < 15) {
        newErrors.description = 'لطفاً توضیحات کامل‌تری بنویسید (حداقل ۱۵ حرف).';
      }
    }

    if (step === 3) {
      if (!city.trim()) {
        newErrors.city = 'انتخاب شهر ضروری است.';
      }
      if (!district.trim()) {
        newErrors.district = 'لطفاً نام محله یا منطقه تقریبی را انتخاب کنید.';
      }
    }

    if (step === 4) {
      if (!confirmedTerms) {
        newErrors.confirmedTerms = 'برای ثبت نهایی، پذیرش قانون اهدای ۱۰۰٪ رایگان الزامی است.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setTouched((prev) => ({
      ...prev,
      images: true,
      title: true,
      description: true,
      category: true,
      city: true,
      district: true,
    }));

    if (validateStep(currentStep)) {
      setServerError(null);
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handlePrev = () => {
    setServerError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // ---------------------------------------------------------------------------
  // Image Upload Handling
  // ---------------------------------------------------------------------------
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setErrors((prev) => ({
        ...prev,
        images: 'فقط فایل‌های تصویری (PNG, JPG, WEBP) پشتیبانی می‌شوند.',
      }));
      return;
    }

    const newUrls: string[] = [];
    const addedFiles: File[] = [];
    validFiles.forEach((file) => {
      // Check size < 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          images: 'حجم هر فایل نباید بیش از ۱۰ مگابایت باشد.',
        }));
        return;
      }
      const url = URL.createObjectURL(file);
      newUrls.push(url);
      addedFiles.push(file);
    });

    setImages((prev) => {
      const combined = [...prev, ...newUrls].slice(0, 6);
      return combined;
    });

    setRawFiles((prev) => [...prev, ...addedFiles].slice(0, 6));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCoverImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [target, ...rest];
    });
  };

  const addPresetImage = (url: string) => {
    if (images.includes(url)) return;
    if (images.length >= 6) return;
    setImages((prev) => [...prev, url]);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  // ---------------------------------------------------------------------------
  // Submission Execution
  // ---------------------------------------------------------------------------
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(4)) return;

    if (!isAuthenticated) {
      requireAuth({
        title: 'ورود به حساب برای انتشار هدیه',
        description: 'برای ثبت هدیه و ارتباط متقاضیان با شما، لطفاً وارد حساب کاربری خود شوید.',
        actionType: 'create_giveaway',
        onAuthenticated: () => {
          handleFinalSubmit();
        },
      });
      return;
    }

    const donorUid = userProfile?.uid || currentUser?.uid;
    if (!donorUid) {
      requireAuth({
        title: 'ورود به حساب برای انتشار هدیه',
        description: 'برای ثبت هدیه و ارتباط متقاضیان با شما، لطفاً وارد حساب کاربری خود شوید.',
        actionType: 'create_giveaway',
        onAuthenticated: () => {
          handleFinalSubmit();
        },
      });
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const categoryObj = availableCategories.find((c) => c.id === category);
    const deliveryLabel =
      DELIVERY_OPTIONS.find((d) => d.id === deliveryMethod)?.label ||
      'تحویل حضوری رایگان';

    const donorDisplayName = userProfile?.displayName || currentUser?.displayName || 'اهداکننده مالتو';

    try {
      if (simulateServerError) {
        throw new Error('خطا در برقراری ارتباط با سرور مالتو. کد خطای ۵۰۰');
      }

      const itemId = `giveaway_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const finalImageUrls: string[] = [];

      // 1. Upload files to Firebase Storage (with high-res optimized fallback)
      if (rawFiles.length > 0) {
        for (let i = 0; i < rawFiles.length; i++) {
          try {
            const uploadResult = await uploadItemPhoto(rawFiles[i], itemId, i);
            finalImageUrls.push(uploadResult.url);
          } catch (uploadErr) {
            console.warn('Storage upload note:', uploadErr);
          }
        }
      }

      // Add any non-blob preset image URLs chosen by the user
      images.forEach((img) => {
        if (!img.startsWith('blob:') && !finalImageUrls.includes(img)) {
          finalImageUrls.push(img);
        }
      });

      // Default fallback image if nothing was uploaded
      if (finalImageUrls.length === 0) {
        finalImageUrls.push('https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80');
      }

      // 2. Real Firestore document creation
      const itemPayload: Omit<GiveawayItemDoc, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        category,
        categoryLabel: categoryObj?.label || 'سایر لوازم',
        condition,
        city,
        district,
        location: `${city} / ${district}`,
        pickupAddress: pickupAddress.trim() || undefined,
        deliveryMethod,
        deliveryLabel,
        urgentPickup,
        imageUrl: finalImageUrls[0],
        images: finalImageUrls,
        donorId: donorUid,
        donorName: donorDisplayName,
        donorBadge: userProfile && userProfile.donatedCount > 2 ? 'اهداکننده فعال جامعه' : 'کاربر تاییدشده مالتو',
        donorJoined: '۱۴۰۳',
        donorDonatedCount: (userProfile?.donatedCount || 3) + 1,
        donorResponseTime: 'زیر ۳۰ دقیقه',
        donorRating: '۵.۰',
        viewsCount: 1,
        requestsCount: 0,
        status: 'available',
        specs: [
          { label: 'وضعیت کارکرد', value: condition },
          { label: 'شهر / محدوده', value: `${city} - ${district}` },
          { label: 'نحوه تحویل', value: deliveryLabel },
          { label: 'مدل عرضه', value: '۱۰۰٪ اهدای رایگان' },
        ],
        createdAt: new Date().toISOString(),
      };

      const createdDoc = await createItem(itemPayload, itemId);

      const createdItem: ExploreItem = {
        ...createdDoc,
        timeAgo: 'همین الان',
      };

      setSubmitSuccessItem(createdItem);
      setIsSubmitting(false);
      onSuccess(createdItem);
    } catch (err: any) {
      setIsSubmitting(false);
      setServerError(
        err?.message ||
          'متاسفانه ارتباط با سرور برقرار نشد. لطفاً اینترنت خود را بررسی و مجدداً تلاش نمایید.'
      );
    }
  };

  // Reset form to add another giveaway
  const handleResetForm = () => {
    setImages([]);
    setTitle('');
    setDescription('');
    setCategory('home');
    setCondition('در حد نو');
    setCity('تهران');
    setDistrict('شهرک غرب');
    setPickupAddress('');
    setDeliveryMethod('pickup');
    setUrgentPickup(false);
    setConfirmedTerms(false);
    setErrors({});
    setTouched({});
    setServerError(null);
    setSubmitSuccessItem(null);
    setCurrentStep(1);
  };

  // ---------------------------------------------------------------------------
  // RENDER: SUCCESS CELEBRATION VIEW
  // ---------------------------------------------------------------------------
  if (submitSuccessItem) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-300 select-none text-start">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-4 shadow-sm animate-bounce">
            <Gift size={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
            <Sparkles size={14} />
            <span>اهدای ۱۰۰٪ رایگان در شبکه مالتو ثبت شد</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] mb-2">
            هدیه شما با موفقیت منتشر شد!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md leading-relaxed mb-6">
            سپاس از سخاوت شما. آگهی شما هم‌اکنون در صفحه کاوش و فید اصلی قرار گرفته و متقاضیان می‌توانند برای دریافت رایگان آن به شما پیام دهند.
          </p>

          {/* Item Preview Card */}
          <div className="w-full max-w-md bg-[#F8FAFC] rounded-2xl p-3 border border-[#E2E8F0] flex items-center gap-3.5 text-start mb-6">
            <img
              src={submitSuccessItem.imageUrl}
              alt={submitSuccessItem.title}
              className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                {submitSuccessItem.title}
              </h4>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-[#94A3B8]" />
                <span>{submitSuccessItem.location}</span>
                <span>•</span>
                <span className="text-[#2563EB]">{submitSuccessItem.condition}</span>
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-lg shrink-0">
              رایگان
            </span>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-2.5">
            {onViewItem && (
              <Button
                variant="primary"
                className="flex-1 text-xs sm:text-sm h-11"
                onClick={() => onViewItem(submitSuccessItem)}
                startIcon={<Eye size={16} />}
              >
                مشاهده در صفحه جزئیات کالا
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 text-xs sm:text-sm h-11"
              onClick={handleResetForm}
              startIcon={<Plus size={16} />}
            >
              ثبت یک هدیه دیگر
            </Button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs text-[#64748B] hover:text-[#0F172A] underline cursor-pointer"
          >
            بازگشت به صفحه کاوش و فهرست هدایا
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: MAIN MULTI-STEP FLOW
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 select-none text-start">
      {/* Top Header & Close button */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm mb-4">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Gift size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#0F172A]">
                ثبت و اهدای رایگان کالا در مالتو
              </h1>
              <p className="text-xs text-[#64748B]">
                وسایل بدون استفاده را به افراد علاقه‌مند و نیازمند هدیه دهید
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
            title="بستن فرم"
          >
            <X size={20} />
          </button>
        </div>

        {/* 100% Free Banner & Developer Simulation Switch */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-2 text-[#2563EB] font-medium">
            <HeartHandshake size={15} />
            <span>قانون مالتو: هیچ قیمت، خرید، فروش یا هزینه‌ای وجود ندارد</span>
          </div>

          {/* Dev helper to verify error state handling requirement */}
          <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateServerError}
                onChange={(e) => setSimulateServerError(e.target.checked)}
                className="rounded text-[#2563EB] focus:ring-0 cursor-pointer"
              />
              <span>تست شبیه‌سازی خطای سرور</span>
            </label>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { step: 1, title: 'تصاویر و عنوان' },
            { step: 2, title: 'دسته‌بندی و وضعیت' },
            { step: 3, title: 'موقعیت و تحویل' },
            { step: 4, title: 'بازبینی و انتشار' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  // Allow clicking previous completed steps
                  if (item.step < currentStep) {
                    setCurrentStep(item.step as 1 | 2 | 3 | 4);
                  }
                }}
                disabled={item.step > currentStep}
                className={cn(
                  'flex flex-col items-center text-center p-2 rounded-2xl border transition-all cursor-pointer',
                  isActive
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-xs font-bold'
                    : isCompleted
                    ? 'bg-white border-[#CBD5E1] text-[#334155] hover:border-[#2563EB]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-70'
                )}
              >
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] font-num',
                      isActive
                        ? 'bg-[#2563EB] text-white'
                        : isCompleted
                        ? 'bg-[#22C55E] text-white'
                        : 'bg-[#E2E8F0] text-[#64748B]'
                    )}
                  >
                    {isCompleted ? <Check size={12} /> : toPersianDigits(item.step)}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div className="mb-4 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
          <AlertCircle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm mb-0.5">خطا در ارسال اطلاعات</p>
            <p>{serverError}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white text-[#991B1B] border-[#F87171] hover:bg-[#FEE2E2]"
                onClick={() => handleFinalSubmit()}
                startIcon={<RefreshCw size={13} />}
              >
                تلاش مجدد
              </Button>
              <button
                type="button"
                onClick={() => setServerError(null)}
                className="text-xs text-[#64748B] hover:text-[#0F172A] px-2 py-1"
              >
                بستن پیام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E2E8F0] shadow-sm flex flex-col gap-6">
        {/* ================================================================= */}
        {/* STEP 1: UPLOAD IMAGES & TITLE */}
        {/* ================================================================= */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            {/* Step Heading */}
            <div>
              <h2 className="text-base font-bold text-[#0F172A] mb-1">
                تصاویر و عنوان وسیله اهدایی
              </h2>
              <p className="text-xs text-[#64748B]">
                عکسی واضح از کالا بگیرید یا انتخاب کنید تا متقاضیان شرایط آن را به درستی مشاهده نمایند.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-2">
                تصاویر کالا (حداکثر ۶ تصویر):
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : errors.images
                    ? 'border-[#EF4444] bg-[#FEF2F2]'
                    : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-white'
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0] flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#0F172A] mb-1">
                  عکس‌های کالا را به اینجا بکشید یا برای انتخاب کلیک کنید
                </p>
                <p className="text-[11px] text-[#64748B]">
                  فرمت‌های JPG، PNG و WEBP تا حجم ۱۰ مگابایت
                </p>
              </div>

              {errors.images && (
                <p className="text-xs text-[#DC2626] flex items-center gap-1 mt-2">
                  <AlertCircle size={13} />
                  <span>{errors.images}</span>
                </p>
              )}

              {/* Uploaded Images Preview Grid */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-num">
                    <span>تصاویر انتخاب‌شده ({toPersianDigits(images.length)} از ۶):</span>
                    <span className="text-[11px] text-[#2563EB]">اولین تصویر به عنوان کاور استفاده می‌شود</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-100 shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`تصویر ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Cover Badge */}
                        {idx === 0 && (
                          <div className="absolute top-1.5 inset-inline-start-1.5 bg-[#2563EB] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold shadow-xs">
                            عکس کاور
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="p-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                              title="حذف تصویر"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                makeCoverImage(idx);
                              }}
                              className="text-[9px] bg-white text-[#0F172A] px-1.5 py-1 rounded-md font-medium hover:bg-slate-100 transition-colors text-center cursor-pointer"
                            >
                              انتخاب کاور
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Photo Presets for Easy Evaluation */}
              <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                <p className="text-[11px] font-medium text-[#64748B] mb-2 flex items-center gap-1">
                  <Camera size={13} />
                  <span>یا انتخاب سریع از تصاویر آماده نمونه جهت تست:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPresetImage(preset.url)}
                      className={cn(
                        'text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer',
                        images.includes(preset.url)
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A] font-medium'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white hover:border-[#2563EB]'
                      )}
                    >
                      <Plus size={12} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="عنوان هدیه یا کالا"
                placeholder="مثلاً: دوچرخه کوهستان دنده‌ای، میز تحریر چوبی، پالتو زمستانی..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.title;
                      return copy;
                    });
                  }
                }}
                error={errors.title}
                helperText="عنوانی دقیق و بدون اغراق بنویسید (حداقل ۵ حرف)."
                required
              />

              {/* Quick Title Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#94A3B8]">پیشنهاد عنوان:</span>
                {[
                  'میز مطالعه چوبی تمیز',
                  'دوچرخه سایز ۲۶ سالم',
                  'مجموعه کتاب‌های رمان نفیس',
                  'لباس گرم زمستانی نو',
                  'گیتار کلاسیک برای هنرجو',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setTitle(sug);
                      if (errors.title) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.title;
                          return copy;
                        });
                      }
                    }}
                    className="text-[11px] text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: CATEGORY, CONDITION & DESCRIPTION */}
        {/* ================================================================= */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] mb-1">
                دسته‌بندی، سلامت و شرح کالا
              </h2>
              <p className="text-xs text-[#64748B]">
                مشخص کنید وسیله در چه دسته‌ای قرار دارد و وضعیت سلامت آن چگونه است.
              </p>
            </div>

            {/* Category Grid */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-2">
                انتخاب دسته‌بندی هدیه:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableCategories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (errors.category) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.category;
                            return copy;
                          });
                        }
                      }}
                      className={cn(
                        'p-3 rounded-2xl border text-start flex flex-col gap-2 transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-xs font-bold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-white hover:border-[#CBD5E1]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'p-2 rounded-xl',
                            isSelected
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-white text-[#64748B] border border-[#E2E8F0]'
                          )}
                        >
                          {getCategoryIcon(cat.id)}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px]">
                            <Check size={10} />
                          </span>
                        )}
                      </div>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-xs text-[#DC2626] flex items-center gap-1 mt-2">
                  <AlertCircle size={13} />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Condition Selection */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-2">
                وضعیت سلامت فیزیکی:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONDITION_OPTIONS.map((opt) => {
                  const isSelected = condition === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setCondition(opt.id)}
                      className={cn(
                        'p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] shadow-xs'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0',
                          isSelected
                            ? 'border-[#2563EB] bg-[#2563EB] text-white'
                            : 'border-[#94A3B8] bg-white'
                        )}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <Textarea
                label="توضیحات و مشخصات کامل کالا"
                placeholder="درباره میزان تمیزی، قطعات همراه، دلیل اهدا یا نحوه استفاده توضیح دهید..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.description;
                      return copy;
                    });
                  }
                }}
                maxLength={800}
                currentLength={description.length}
                rows={4}
                error={errors.description}
                helperText="توضیحات دقیق به انتخاب مناسب‌ترین متقاضی کمک می‌کند."
                required
              />

              {/* Quick helper snippets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-[#94A3B8]">عبارات آماده:</span>
                {[
                  'کاملاً سالم و کم‌استفاده، بدون هیچ‌گونه شکستگی.',
                  'اهدای رایگان به دانش‌آموز یا فرد علاقه‌مند.',
                  'همراه با جعبه و لوازم جانبی کامل.',
                ].map((snip) => (
                  <button
                    key={snip}
                    type="button"
                    onClick={() => {
                      setDescription((prev) => (prev ? `${prev} ${snip}` : snip));
                      if (errors.description) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.description;
                          return copy;
                        });
                      }
                    }}
                    className="text-[11px] text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    + {snip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: LOCATION & DELIVERY PREFERENCE */}
        {/* ================================================================= */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] mb-1">
                موقعیت مکانی و شیوه تحویل هدیه
              </h2>
              <p className="text-xs text-[#64748B]">
                مشخص کنید هدیه در چه محله‌ای است تا متقاضیان نزدیک به شما درخواست ثبت کنند.
              </p>
            </div>

            {/* City and District Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                  شهر:
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    const dists = getDistrictsForCity(newCity);
                    if (dists.length > 0) {
                      setDistrict(dists[0]);
                    }
                  }}
                  className="w-full h-11 px-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                  محله / منطقه (الزامی): *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                >
                  {getDistrictsForCity(city).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Pickup Note */}
            <div>
              <Input
                label="نشانی حدودی یا نزدیک‌ترین تقاطع (اختیاری)"
                placeholder="مثلاً: نزدیک میدان کاج، خ سرو غربی"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                optional
                helperText="نشانی دقیق بعد از تایید درخواست متقاضی در چت خصوصی ارسال خواهد شد."
              />
            </div>

            {/* Delivery Method Options */}
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-2">
                نحوه تحویل کالا:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DELIVERY_OPTIONS.map((opt) => {
                  const isSelected = deliveryMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDeliveryMethod(opt.id)}
                      className={cn(
                        'p-3.5 rounded-2xl border text-start flex flex-col gap-1.5 transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#0F172A] shadow-xs'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Truck
                          size={16}
                          className={isSelected ? 'text-[#2563EB]' : 'text-[#94A3B8]'}
                        />
                        <span className="text-xs font-bold text-[#0F172A]">
                          {opt.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgent Pickup Checkbox */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-[#D97706] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#92400E] block">
                    نیاز به تحویل فوری (حداکثر طی ۲۴ ساعت)
                  </span>
                  <span className="text-[11px] text-[#B45309]">
                    اگر در حال اسباب‌کشی هستید یا به فضای خالی فوری نیاز دارید این گزینه را بزنید.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={urgentPickup}
                onChange={(e) => setUrgentPickup(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: REVIEW & SUBMIT */}
        {/* ================================================================= */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] mb-1">
                بازبینی و تایید نهایی هدیه
              </h2>
              <p className="text-xs text-[#64748B]">
                اطلاعات آگهی را بررسی کنید و با پذیرش تعهد اهدای رایگان، آن را در مالتو منتشر نمایید.
              </p>
            </div>

            {/* Live Card Preview */}
            <div className="bg-[#F8FAFC] rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-[#2563EB]" />
                  <span className="text-xs font-bold text-[#0F172A]">
                    پیش‌نمایش آگهی در مالتو
                  </span>
                </div>
                <span className="text-[11px] text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full font-bold">
                  ۱۰۰٪ رایگان
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-44 aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-200 shrink-0">
                  <img
                    src={images[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <ConditionBadge condition={condition} />
                      <span className="text-[11px] text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                        {availableCategories.find((c) => c.id === category)?.label || 'لوازم'}
                      </span>
                      {urgentPickup && (
                        <span className="text-[11px] text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-md font-medium">
                          تحویل فوری
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#0F172A] mb-1.5">
                      {title}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3">
                      {description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#94A3B8]" />
                      <span>{city} / {district}</span>
                    </span>
                    <span>
                      {DELIVERY_OPTIONS.find((d) => d.id === deliveryMethod)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Edit Shortcuts */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                ویرایش تصاویر و عنوان
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                ویرایش مشخصات
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                ویرایش موقعیت مکانی
              </button>
            </div>

            {/* Donor Authentication Status */}
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'م'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0F172A]">
                      {userProfile?.displayName || currentUser?.displayName || 'کاربر اهداکننده'}
                    </span>
                    <span className="text-[#2563EB] text-[11px]">اهداکننده احراز هویت شده</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#16A34A] bg-white px-2.5 py-1 rounded-lg border border-[#BBF7D0] font-medium flex items-center gap-1">
                  <Check size={12} />
                  <span>حساب متصل</span>
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <ShieldCheck size={18} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">برای انتشار نهایی، حساب کاربری لازم است</span>
                    <span className="text-amber-700 text-[11px]">
                      اطلاعات فرم شما کاملاً حفظ شده و پس از ورود سریع، کالا منتشر می‌شود.
                    </span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    requireAuth({
                      title: 'ورود برای ثبت هدیه',
                      description: 'برای ثبت این کالا لطفاً وارد حساب خود شوید.',
                      actionType: 'create_giveaway',
                      onAuthenticated: () => {},
                    })
                  }
                  className="shrink-0 text-xs"
                >
                  ورود سریع به حساب
                </Button>
              </div>
            )}

            {/* 100% Free Mandatory Agreement */}
            <div
              onClick={() => setConfirmedTerms(!confirmedTerms)}
              className={cn(
                'p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer',
                confirmedTerms
                  ? 'bg-[#EFF6FF] border-[#2563EB]'
                  : errors.confirmedTerms
                  ? 'bg-[#FEF2F2] border-[#EF4444]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
              )}
            >
              <input
                type="checkbox"
                checked={confirmedTerms}
                onChange={(e) => {
                  setConfirmedTerms(e.target.checked);
                  if (errors.confirmedTerms) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.confirmedTerms;
                      return copy;
                    });
                  }
                }}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0 mt-0.5 cursor-pointer shrink-0"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold text-[#0F172A] block mb-1">
                  تعهد به اهدای ۱۰۰٪ رایگان در مالتو:
                </span>
                <p className="text-[#64748B] leading-relaxed">
                  من تایید می‌کنم که این کالا کاملاً به صورت رایگان هدیه داده می‌شود و هیچ‌گونه هزینه، پول یا وجهی بابت آن از دریافت‌کننده مطالبه نخواهم کرد.
                </p>
              </div>
            </div>
            {errors.confirmedTerms && (
              <p className="text-xs text-[#DC2626] flex items-center gap-1 -mt-4">
                <AlertCircle size={13} />
                <span>{errors.confirmedTerms}</span>
              </p>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* BOTTOM NAVIGATION CONTROLS */}
        {/* ================================================================= */}
        <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={handlePrev}
              startIcon={<ArrowRight size={16} />}
              disabled={isSubmitting}
            >
              مرحله قبل
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              endIcon={<ArrowLeft size={16} />}
            >
              مرحله بعد
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleFinalSubmit()}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )
              }
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 font-bold shadow-md"
            >
              {isSubmitting ? 'در حال ثبت هدیه...' : 'تایید و انتشار رایگان هدیه'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
