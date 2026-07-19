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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  // 2. Styling maps for our visual variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white focus:ring-blue-500 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white focus:ring-red-500 shadow-md shadow-red-500/10 hover:shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-slate-900 active:bg-slate-850 text-slate-400 hover:text-white focus:ring-slate-700',
  };

  // 3. Padding and font size configurations based on size
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
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
      <span>{children}</span>

      {/* 4. Right Icon (rendered only if not loading) */}
      {!isLoading && RightIcon && (
        <RightIcon className="h-4 w-4 flex-shrink-0" />
      )}
    </button>
  );
}
