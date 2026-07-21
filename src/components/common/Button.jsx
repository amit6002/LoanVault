import { Loader2 } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE BUTTON COMPONENT
 * The core design system button. Supports variants, sizes, 
 * loading states, and icon alignment.
 * ============================================================
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  className = '',
  ...props
}) {
  // 1. Base styles shared by all buttons
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:hover:translate-y-0 cursor-pointer';

  // 2. Styling maps for our visual variants
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80 focus:ring-slate-400 shadow-xs hover:shadow-sm',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-indigo-500 shadow-xs hover:shadow-md hover:shadow-slate-200',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus:ring-slate-400',
  };

  // 3. Padding and font size configurations based on size
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant] || variants.primary} 
        ${sizes[size] || sizes.md} 
        ${className}
      `}
      {...props}
    >
      {/* 1. Loading Spinner (takes priority over LeftIcon) */}
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
      ) : (
        // 2. Left Icon (if provided and not loading)
        LeftIcon && <LeftIcon className="h-4 w-4 flex-shrink-0" />
      )}

      {/* 3. Button Text (wrapped children) */}
      {children && <span>{children}</span>}

      {/* 4. Right Icon (rendered only if not loading) */}
      {!isLoading && RightIcon && (
        <RightIcon className="h-4 w-4 flex-shrink-0" />
      )}
    </button>
  );
}
