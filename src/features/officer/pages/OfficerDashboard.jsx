import { Landmark, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN OFFICER DASHBOARD COMPONENT
 * Renders pending workload statistics, verification queues,
 * and high-priority action warnings.
 * ============================================================
 */
export default function OfficerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const officerName = session.name || 'Officer';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {officerName}
          </h1>
          <p className="text-sm text-slate-400">
            Workload Status: <span className="text-amber-500 font-semibold">Active Review Session</span>
          </p>
        </div>

        <div className="relative z-10">
          <Button 
            variant="primary" 
            size="md" 
            rightIcon={ArrowRight}
            onClick={() => navigate(PATHS.OFFICER_QUEUE)}
          >
            Open Review Queue
          </Button>
        </div>
      </div>

      {/* 2. Workload Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Cases Pending Verification */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><Clock className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</p>
          <p className="text-2xl font-black text-white">14 Cases</p>
        </div>

        {/* SLA Nearing Expiry */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20"><AlertTriangle className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA Nearing Expiry</p>
          <p className="text-2xl font-black text-amber-500">3 Cases</p>
        </div>

        {/* Verified Today */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Today</p>
          <p className="text-2xl font-black text-emerald-400">8 Cases</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/20"><ShieldCheck className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Pass Rate</p>
          <p className="text-2xl font-black text-white">96.5%</p>
        </div>

      </div>

      {/* 3. Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Priority tasks alerts (8 columns on desktop) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            High Priority Alerts
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400">CIBIL Offline Warning</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  The Credit Information Bureau network node is undergoing scheduled server updates. Manual reports can be pulled via local backup APIs if required.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400">Quarterly Audit Compliance Check</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ensure all loan recommendations have completed verification logs attached. Audit inspection checklist releases on 25 Aug 2026.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar / Tasks Panel (4 columns on desktop) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Operational Links
          </h2>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate(PATHS.OFFICER_QUEUE)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Go to Document Verification Queue
            </button>
            <button onClick={() => navigate(PATHS.OFFICER_PERFORMANCE)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Check Monthly Performance Reports
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
