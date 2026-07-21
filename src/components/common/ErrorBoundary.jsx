import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { PATHS } from '../../utils/constants';

/**
 * Route Error Boundary Component
 * Catches unhandled runtime errors in page routes and renders a high-quality fallback UX.
 */
export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage = error?.statusText || error?.message || 'An unexpected error occurred.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-white mb-2">Unexpected Application Error</h1>
        <p className="text-slate-400 text-sm mb-6">
          Something went wrong while rendering this page. Our team has been notified.
        </p>

        {/* Error Details snippet */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 mb-6 text-left overflow-x-auto">
          <p className="text-xs font-mono text-rose-300 break-words">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <button
            onClick={() => navigate(PATHS.HOME)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition-all border border-slate-700/50"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
