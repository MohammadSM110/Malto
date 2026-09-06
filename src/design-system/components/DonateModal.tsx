import React, { useState } from 'react';
import { cn } from '../utils/cn.ts';
import { Button } from './Button.tsx';
import { Input } from './Input.tsx';
import { Textarea } from './Textarea.tsx';
import { X, CheckCircle2 } from 'lucide-react';

export interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitItem?: (newItem: {
    title: string;
    description: string;
    condition: string;
    location: string;
    category: string;
  }) => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  onSubmitItem,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('سالم');
  const [category, setCategory] = useState('پوشیدنی');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmitItem?.({
      title,
      description: description || 'کاملاً سالم و بدون نقص، اهدای رایگان به اعضای مالتو',
      condition,
      location: 'تهران / شهرک غرب',
      category,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setTitle('');
      setDescription('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col text-start animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">اهدا کردن کالا در مالتو</h2>
            <p className="text-xs text-[#64748B]">وسایل سالم خود را رایگان به چرخه زندگی برگردانید</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">هدیه شما با موفقیت ثبت شد!</h3>
            <p className="text-xs text-[#64748B]">
              به‌زودی در فید مالتو نمایش داده می‌شود و متقاضیان می‌توانند برای دریافت آن پیام ارسال کنند.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <Input
              label="عنوان وسیله یا کالا"
              placeholder="مثلاً: دوچرخه کوهستان، لباس نوزادی، کتاب‌های رمان..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="توضیحات و شرایط کالا"
              placeholder="درباره میزان سلامت وسیله، قطعات همراه و نحوه تحویل توضیح دهید..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Condition Picker */}
            <div>
              <label className="text-xs font-medium text-[#0F172A] block mb-2">
                وضعیت سلامت کالا:
              </label>
              <div className="flex flex-wrap gap-2">
                {['سالم', 'کاملاً نو', 'در حد نو', 'نیازمند تعمیر جزئی'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                      condition === c
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Picker */}
            <div>
              <label className="text-xs font-medium text-[#0F172A] block mb-2">
                دسته‌بندی:
              </label>
              <div className="flex flex-wrap gap-2">
                {['پوشیدنی', 'کودک', 'کتاب', 'مبلمان', 'سرگرمی', 'ابزار'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                      category === cat
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth className="mt-2">
              ثبت رایگان و اهدا به دیگران
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
