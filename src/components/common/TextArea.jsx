import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * REUSABLE CUSTOM TEXTAREA COMPONENT (LIGHT THEME)
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
  const textareaId = id || `textarea-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={textareaId}
          className={`text-xs font-bold uppercase tracking-wider ${
            disabled ? 'text-slate-400' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
      )}

      {/* 2. Textarea Field Wrapper */}
      <div className="relative flex items-start">
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-white border text-slate-900 placeholder-slate-400 rounded-xl text-sm font-medium transition-all duration-150 outline-none p-4 resize-y min-h-[80px]
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:opacity-60 disabled:pointer-events-none
            ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 pr-10' : 'border-slate-200 hover:border-slate-300'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <div className="absolute right-3.5 top-3.5 flex items-center justify-center text-rose-500 pointer-events-none">
            <AlertCircle className="h-4 w-4" />
          </div>
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

TextArea.displayName = 'TextArea';

export default TextArea;
