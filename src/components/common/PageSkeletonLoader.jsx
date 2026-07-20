import { Landmark } from 'lucide-react';

/**
 * ============================================================
 * SLEEK FINTECH PAGE SKELETON LOADER COMPONENT
 * Renders smooth pulsing cards and a glowing bank logo spinner
 * during data fetching to eliminate lag perception.
 * ============================================================
 */
export default function PageSkeletonLoader({ title = 'Loading Data...' }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 py-4">
      {/* Header Loading Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800/60 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-slate-800/40 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-blue-600/30 rounded-xl animate-pulse" />
      </div>

      {/* Central Glowing Spinner Indicator */}
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute p-2 bg-blue-600/20 text-blue-400 rounded-lg">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-300 tracking-wide">{title}</p>
      </div>

      {/* Grid Cards Pulse Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-800 rounded-xl" />
            </div>
            <div className="h-8 w-32 bg-slate-800 rounded-lg" />
            <div className="h-3 w-20 bg-slate-850 rounded" />
          </div>
        ))}
      </div>

      {/* Main Panels Pulse Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl h-64 animate-pulse space-y-4">
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="h-40 bg-slate-950/60 rounded-xl" />
        </div>
        <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl h-64 animate-pulse space-y-4">
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="h-40 bg-slate-950/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
