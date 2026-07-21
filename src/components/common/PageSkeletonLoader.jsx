import { Landmark } from 'lucide-react';

/**
 * ============================================================
 * SLEEK FINTECH PAGE SKELETON LOADER COMPONENT (LIGHT THEME)
 * Renders smooth pulsing cards and a glowing bank logo spinner
 * during data fetching to eliminate lag perception.
 * ============================================================
 */
export default function PageSkeletonLoader({ title = 'Loading Data...' }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-4">
      {/* Header Loading Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-indigo-100 rounded-xl animate-pulse" />
      </div>

      {/* Central Glowing Spinner Indicator */}
      <div className="p-8 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center shadow-xs">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <div className="absolute p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-700 tracking-wide">{title}</p>
      </div>

      {/* Grid Cards Pulse Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 animate-pulse shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded-lg" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Panels Pulse Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl h-64 animate-pulse space-y-4 shadow-xs">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-40 bg-slate-50 rounded-xl" />
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-2xl h-64 animate-pulse space-y-4 shadow-xs">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-40 bg-slate-50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
