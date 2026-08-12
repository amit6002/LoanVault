import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * ============================================================
 * ADVANCED MODAL COMPONENT
 * - Centres content on screen with smooth scale animation
 * - Locks body scroll when open (compensates for scrollbar width)
 * - Keyboard Escape support
 * - Backdrop click to close (optional)
 * - Configurable sizes: sm | md | lg | xl | full
 * ============================================================
 */
export default function Modal({
  isOpen = false,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) {
  const modalRef = useRef(null);

  const sizeClasses = {
    sm:   'max-w-sm',
    md:   'max-w-2xl',
    lg:   'max-w-4xl',
    xl:   'max-w-5xl',
    full: 'max-w-6xl',
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll, compensate for scrollbar width
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal-content bg-white rounded-3xl shadow-card-xl max-h-[90vh] overflow-hidden flex flex-col ${sizeClasses[size]} w-full ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-transparent">
            {title ? (
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={() => onClose?.()}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-smooth-fast ml-auto border border-transparent hover:border-slate-200"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
