import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE ACCESSIBLE INPUT COMPONENT
 * Implements Ref Forwarding using forwardRef.
 * Supports custom labels, left/right icons, error displays,
 * and passes through standard input attributes.
 * ============================================================
 */
const Input = forwardRef(({
  label,
  error,
  type = 'text',
  id,
  className = '',
  disabled = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  ...props
}, ref) => {
  // Generate a unique ID fallback if none is provided to match labels to input elements
  const inputId = id || `input-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={inputId}
          className={`text-sm font-semibold tracking-wide ${
            disabled ? 'text-slate-500' : 'text-slate-300'
          }`}
        >
          {label}
        </label>
      )}

      {/* 2. Input Field Container Wrapper (relative wrapper to position icons inside) */}
      <div className="relative flex items-center">
        {/* Left Icon (Absolute Positioning) */}
        {LeftIcon && (
          <div className="absolute left-3.5 flex items-center justify-center text-slate-500 pointer-events-none">
            <LeftIcon className="h-5 w-5" />
          </div>
        )}

        {/* The Native HTML Input element */}
        <input
          ref={ref}
          type={type}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full h-11 bg-slate-900 border text-slate-100 rounded-lg text-sm font-medium transition-all duration-150 outline-none
            focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:opacity-50 disabled:pointer-events-none
            ${LeftIcon ? 'pl-11' : 'pl-4'} 
            ${RightIcon || error ? 'pr-11' : 'pr-4'}
            ${error ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' : 'border-slate-800 hover:border-slate-700 focus:ring-blue-500/25 focus:border-blue-500'}
            ${className}
          `}
          {...props}
        />

        {/* Right Icon or Error Warning Indicator (Absolute Positioning) */}
        {error ? (
          <div className="absolute right-3.5 flex items-center justify-center text-red-500 pointer-events-none">
            <AlertCircle className="h-5 w-5" />
          </div>
        ) : (
          RightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-500 pointer-events-none">
              <RightIcon className="h-5 w-5" />
            </div>
          )
        )}
      </div>

      {/* 3. Error Feedback Text block */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-semibold text-red-500 tracking-wide flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          {error}
        </p>
      )}
    </div>
  );
});

// Set display name for better React DevTools debugging output
Input.displayName = 'Input';

export default Input;
