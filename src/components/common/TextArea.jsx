import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE CUSTOM TEXTAREA COMPONENT
 * Implements Ref Forwarding using forwardRef.
 * Standardizes styling for multiline text input fields, labels,
 * and error indicators.
 * ============================================================
 */
const TextArea = forwardRef(({
  label,
  error,
  id,
  className = '',
  disabled = false,
  rows = 4,
  ...props
}, ref) => {
  // Generate a unique ID fallback if none is provided to match labels to textarea elements
  const textareaId = id || `textarea-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={textareaId}
          className={`text-sm font-semibold tracking-wide ${
            disabled ? 'text-slate-500' : 'text-slate-300'
          }`}
        >
          {label}
        </label>
      )}

      {/* 2. Textarea Field Wrapper */}
      <div className="relative flex items-start">
        {/* The Native HTML Textarea element */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-slate-900 border text-slate-100 rounded-lg text-sm font-medium transition-all duration-150 outline-none p-4 resize-y min-h-[80px]
            focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:opacity-50 disabled:pointer-events-none
            ${error ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500 pr-11' : 'border-slate-800 hover:border-slate-700 focus:ring-blue-500/25 focus:border-blue-500'}
            ${className}
          `}
          {...props}
        />

        {/* Absolute Error indicator overlay */}
        {error && (
          <div className="absolute right-3.5 top-3.5 flex items-center justify-center text-red-500 pointer-events-none">
            <AlertCircle className="h-5 w-5" />
          </div>
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
TextArea.displayName = 'TextArea';

export default TextArea;
