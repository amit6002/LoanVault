import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ChevronRight, Bell, Calendar, Activity, Coins, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * BORROWER DASHBOARD COMPONENT
 * Redesigned to match modern dark-mode UI aesthetic.
 * Displays top 3 stat cards (Total Outstanding, Next EMI Due, Active Loans),
 * Doughnut loan overview breakdown, upcoming payments, recent activity timeline,
 * and prominent incomplete profile warning banner when profile is incomplete.
 * ============================================================
 */
export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const borrowerName = session.name || 'Valued Customer';

  const [userProfile, setUserProfile] = useState(null);
  const [summary, setSummary] = useState({
    activeLoansCount: 0,
    totalSanctioned: 0,
    totalOutstanding: 0,
    monthlyOutflow: 0,
  });
  const [activeLoans, setActiveLoans] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user profile from Neon DB
      const profileRes = await api.get('/api/user/profile').catch(() => null);
      if (profileRes) {
        setUserProfile(profileRes);
      }

      // 2. Fetch summary stats
      const summaryRes = await api.get('/api/loans/summary').catch(() => null);
      if (summaryRes) {
        setSummary({
          activeLoansCount: summaryRes.activeLoansCount || 0,
          totalSanctioned: summaryRes.totalSanctioned || 0,
          totalOutstanding: summaryRes.totalOutstanding || 0,
          monthlyOutflow: summaryRes.monthlyOutflow || 0,
        });
      }

      // 3. Fetch active loans list
      const loansRes = await api.get('/api/loans/my').catch(() => []);
      const loans = (Array.isArray(loansRes) ? loansRes : []).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        type: `${l.loanType || 'Personal'} Loan`,
        amount: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        nextEmi: l.emiAmount || 0,
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Aug 2026',
        progress: l.sanctionedAmount > 0 ? Math.round(((l.sanctionedAmount - l.outstandingPrincipal) / l.sanctionedAmount) * 100) : 10,
      }));

      setActiveLoans(loans);

      // 4. Fetch recent applications
      const appsRes = await api.get('/api/applications/my').catch(() => []);
      setRecentApplications(Array.isArray(appsRes) ? appsRes.slice(0, 4) : []);

    } catch (err) {
      console.warn('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileIncomplete = userProfile && (!userProfile.panNumber || !userProfile.aadhaarNumber || !userProfile.monthlyIncome || !userProfile.addressLine1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* INCOMPLETE PROFILE HEADING BANNER */}
      {isProfileIncomplete && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-md font-bold text-amber-400">⚠️ Profile Incomplete — Action Required</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your profile is missing required information (PAN, Aadhaar, Address, or Income). Please complete your profile to enable automatic pre-filling on new loan applications!
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(PATHS.BORROWER_PROFILE)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-none whitespace-nowrap"
          >
            Complete Profile
          </Button>
        </div>
      )}

      {/* 1. Header Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {userProfile?.name || borrowerName} 👋
          </h1>
          <p className="text-sm text-slate-400">
            Here's your loan portfolio overview and active account updates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full" />
          </button>

          <Link to={PATHS.BORROWER_APPLY}>
            <Button variant="primary" size="md" rightIcon={ArrowRight}>
              Apply for New Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. TOP 3 STAT CARDS (CREDIT HEALTH REMOVED AS EXPLICITLY REQUESTED) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1: Total Outstanding */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">
              {isLoading ? '...' : formatCurrency(summary.totalOutstanding, false)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Across {summary.activeLoansCount} active ongoing loans</p>
          </div>
        </div>

        {/* Stat 2: Next EMI Due */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next EMI Due</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-emerald-400">
              {isLoading ? '...' : formatCurrency(summary.monthlyOutflow, false)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Due on 05 Aug 2026</p>
          </div>
        </div>

        {/* Stat 3: Active Loans */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">
              {isLoading ? '...' : summary.activeLoansCount}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Sanctioned & active in system</p>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE DIVISION (Loan Overview Chart + Upcoming Payments + Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Widget: Loan Portfolio Breakdown (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-md font-bold text-white">Loan Portfolio Breakdown</h2>
            <Link to={PATHS.BORROWER_LOANS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              View All Loans <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {activeLoans.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <Landmark className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active loans found in your portfolio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan, idx) => (
                <div key={loan.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                      {loan.type}
                    </span>
                    <span className="text-slate-200 font-bold">{formatCurrency(loan.outstanding, false)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Sanctioned: {formatCurrency(loan.amount, false)}</span>
                      <span>Next EMI: {formatCurrency(loan.nextEmi)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, loan.progress))}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Widget: Upcoming Payments & Recent Activity (6 columns) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Upcoming Payments Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-white">Upcoming EMI Payments</h2>
              <Link to={PATHS.BORROWER_EMI_CALENDAR} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                View Calendar
              </Link>
            </div>

            <div className="space-y-3">
              {summary.monthlyOutflow > 0 ? (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Monthly Installment</h4>
                      <p className="text-[11px] text-slate-500">Auto-debit due on 05 Aug 2026</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400">{formatCurrency(summary.monthlyOutflow)}</span>
                    <span className="block text-[10px] text-amber-400 font-semibold">Due Soon</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No upcoming payments scheduled.</p>
              )}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" /> Recent Application Activity
              </h2>
              <Link to={PATHS.BORROWER_APPLICATIONS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                View All Activity
              </Link>
            </div>

            <div className="space-y-3">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-start gap-3 text-xs border-b border-slate-850 pb-2.5 last:border-none">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-200 font-semibold">{app.loanType || 'Personal'} Loan ({app.referenceId || app.id})</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Status: <span className="text-emerald-400 font-bold">{app.status}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-2">No recent activity logs.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
