import { useState, useEffect } from 'react';
import { 
  Landmark, FileText, CheckCircle2, Clock, 
  ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN OFFICER DASHBOARD COMPONENT (LIGHT THEME)
 * Displays application review workloads & verification stats.
 * ============================================================
 */
export default function OfficerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const officerName = session.name || 'Amit Kumar (Loan Officer)';

  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingQueueCount();
  }, []);

  const fetchPendingQueueCount = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/applications/queue').catch(() => []);
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.warn('Failed to fetch queue count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-card hover:shadow-lg transition-all">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back, {officerName}
          </h1>
          <p className="text-sm text-slate-500">
            Workload Status: <span className="text-emerald-700 font-bold">Active Review Session</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Cases Pending Verification */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Queue</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${pendingCount} Cases`}
          </p>
        </div>

        {/* Verified Today */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Today</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">8 Cases</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Pass Rate</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">96.5%</p>
        </div>
      </div>
    </div>
  );
}

