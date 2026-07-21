import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { PATHS } from '../../utils/constants';

/**
 * Route Error Boundary Component (Light Theme)
 * Catches unhandled runtime errors in page routes and renders a high-quality fallback UX.
 */
export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage = error?.statusText || error?.message || 'An unexpected error occurred.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Unexpected Application Error</h1>
        <p className="text-slate-500 text-sm mb-6">
          Something went wrong while rendering this page. Our team has been notified.
        </p>

        {/* Error Details snippet */}
        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 mb-6 text-left overflow-x-auto">
          <p className="text-xs font-mono text-rose-700 break-words font-medium">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <button
            onClick={() => navigate(PATHS.HOME)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all border border-slate-200 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
