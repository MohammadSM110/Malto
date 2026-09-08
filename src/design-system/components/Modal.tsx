import React, { useEffect } from 'react';
import { cn } from '../utils/cn.ts';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  hideCloseButton = false,
  closeOnBackdropClick = true,
  className,
  headerClassName,
  bodyClassName,
}) => {
  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          'bg-white rounded-3xl w-full overflow-hidden shadow-2xl border border-[#E2E8F0]',
          'flex flex-col text-start max-h-[90vh] duration-200 animate-in zoom-in-95',
          maxWidthStyles[maxWidth],
          className
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div
            className={cn(
              'p-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0',
              headerClassName
            )}
          >
            <div className="flex flex-col min-w-0 pr-1">
              {typeof title === 'string' ? (
                <h2 className="text-base font-bold text-[#0F172A] truncate">{title}</h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{subtitle}</p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className={cn('p-4 sm:p-5 overflow-y-auto flex-1', bodyClassName)}>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
