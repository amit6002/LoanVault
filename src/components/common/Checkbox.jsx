import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE CUSTOM CHECKBOX COMPONENT
 * Implements Ref Forwarding using forwardRef.
 * Standardizes styling for checkbox boxes, inline descriptions,
 * alignments, and error warnings.
 * ============================================================
 */
const Checkbox = forwardRef(({
  label,
  description,
  error,
  id,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  // Generate a unique ID fallback if none is provided to match labels to checkbox elements
  const checkboxId = id || `checkbox-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Checkbox Row Wrapper */}
      <div className="flex items-start gap-3">
        {/* The Native HTML Checkbox input element */}
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`
              h-4 w-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:ring-offset-0 focus:ring-offset-slate-950 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none
              ${error ? 'border-red-500 focus:ring-red-500/25' : 'border-slate-800 hover:border-slate-700 focus:ring-blue-500/25'}
              ${className}
            `}
            {...props}
          />
        </div>

        {/* 2. Text Content Wrapper (Label + Description) */}
        {(label || description) && (
          <div className="flex flex-col gap-0.5 select-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm font-semibold tracking-wide cursor-pointer ${
                  disabled ? 'text-slate-500' : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={`text-xs ${disabled ? 'text-slate-600' : 'text-slate-500'}`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Error Feedback Text block */}
      {error && (
        <div className="pl-7"> {/* Indent error text to align with the labels, bypassing the checkbox box width */}
          <p
            id={errorId}
            role="alert"
            className="text-xs font-semibold text-red-500 tracking-wide flex items-center gap-1.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
});

// Set display name for better React DevTools debugging output
Checkbox.displayName = 'Checkbox';

export default Checkbox;
