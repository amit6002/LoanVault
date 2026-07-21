import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE ACCESSIBLE INPUT COMPONENT (LIGHT THEME)
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
  const inputId = id || `input-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={inputId}
          className={`text-xs font-bold uppercase tracking-wider ${
            disabled ? 'text-slate-400' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
      )}

      {/* 2. Input Field Container Wrapper */}
      <div className="relative flex items-center">
        {/* Left Icon */}
        {LeftIcon && (
          <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
            <LeftIcon className="h-4 w-4" />
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
            w-full h-11 bg-white border text-slate-900 placeholder-slate-400 rounded-xl text-sm font-medium transition-all duration-150 outline-none
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:opacity-60 disabled:pointer-events-none
            ${LeftIcon ? 'pl-10' : 'pl-4'} 
            ${RightIcon || error ? 'pr-10' : 'pr-4'}
            ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'}
            ${className}
          `}
          {...props}
        />

        {/* Right Icon or Error Warning Indicator */}
        {error ? (
          <div className="absolute right-3.5 flex items-center justify-center text-rose-500 pointer-events-none">
            <AlertCircle className="h-4 w-4" />
          </div>
        ) : (
          RightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-400 pointer-events-none">
              <RightIcon className="h-4 w-4" />
            </div>
          )
        )}
      </div>

      {/* 3. Error Feedback Text block */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-semibold text-rose-600 tracking-wide flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
