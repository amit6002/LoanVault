import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE CUSTOM SELECT COMPONENT
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
  // Generate a unique ID fallback if none is provided to match labels to select elements
  const selectId = id || `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={selectId}
          className={`text-sm font-semibold tracking-wide ${
            disabled ? 'text-slate-500' : 'text-slate-300'
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
            w-full h-11 bg-slate-900 border text-slate-100 rounded-lg text-sm font-medium transition-all duration-150 outline-none pr-10 pl-4
            focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:opacity-50 disabled:pointer-events-none appearance-none cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' : 'border-slate-800 hover:border-slate-700 focus:ring-blue-500/25 focus:border-blue-500'}
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
              className="bg-slate-900 text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon + Error indicator overlay */}
        <div className="absolute right-3.5 flex items-center justify-center pointer-events-none gap-2">
          {error && <AlertCircle className="h-5 w-5 text-red-500" />}
          {/* Native-looking custom dropdown chevron arrow */}
          <svg
            className={`h-4 w-4 ${disabled ? 'text-slate-600' : 'text-slate-400'}`}
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
          className="text-xs font-semibold text-red-500 tracking-wide flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          {error}
        </p>
      )}
    </div>
  );
});

// Set display name for better React DevTools debugging output
Select.displayName = 'Select';

export default Select;
