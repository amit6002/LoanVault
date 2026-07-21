import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE CUSTOM SELECT COMPONENT (LIGHT THEME)
 * Implements Ref Forwarding using forwardRef.
 * Standardizes styling for dropdown select menus, error alerts,
 * and label alignments.
 * ============================================================
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  id,
  className = '',
  disabled = false,
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={selectId}
          className={`text-xs font-bold uppercase tracking-wider ${
            disabled ? 'text-slate-400' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
      )}

      {/* 2. Select Field Wrapper */}
      <div className="relative flex items-center">
        {/* The Native HTML Select element */}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full h-11 bg-white border text-slate-900 rounded-xl text-sm font-medium transition-all duration-150 outline-none pr-10 pl-4
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:opacity-60 disabled:pointer-events-none appearance-none cursor-pointer
            ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300'}
            ${className}
          `}
          {...props}
        >
          {/* Placeholder/Default Option */}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {/* Mapping Options Array */}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-white text-slate-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon + Error indicator overlay */}
        <div className="absolute right-3.5 flex items-center justify-center pointer-events-none gap-2">
          {error && <AlertCircle className="h-4 w-4 text-rose-500" />}
          <svg
            className={`h-4 w-4 ${disabled ? 'text-slate-300' : 'text-slate-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
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

Select.displayName = 'Select';

export default Select;
