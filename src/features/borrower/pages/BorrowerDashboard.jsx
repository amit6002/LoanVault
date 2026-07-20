import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ChevronRight, Bell, Calendar, Activity, Coins, Plus, Download, Upload, HelpCircle, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * BORROWER DASHBOARD COMPONENT
 *  - Quick Actions Bar AT THE TOP of the dashboard
 *  - 4 Top KPIs: Total Outstanding, Next EMI, Active Loans, Credit Score
 *  - Loan Portfolio Breakdown: Doughnut distribution + Total Disbursed/Repaid
 *  - Upcoming EMI Payment Card with direct Pay Now button
 *  - Recent Activity Timeline with checkmarks
 * ============================================================
 */
export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const borrowerName = session.name || 'Rahul Sharma';

  const [userProfile, setUserProfile] = useState(null);
  const [summary, setSummary] = useState({
    activeLoansCount: 2,
    totalSanctioned: 1240800,
    totalOutstanding: 1240800,
    monthlyOutflow: 71539,
    totalDisbursed: 2841600,
    totalRepaid: 1600800,
  });
  const [activeLoans, setActiveLoans] = useState([]);
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
        setSummary(prev => ({
          ...prev,
          activeLoansCount: summaryRes.activeLoansCount || 2,
          totalSanctioned: summaryRes.totalSanctioned || 1240800,
          totalOutstanding: summaryRes.totalOutstanding || 1240800,
          monthlyOutflow: summaryRes.monthlyOutflow || 71539,
        }));
      }

      // 3. Fetch active loans list
      const loansRes = await api.get('/api/loans/my').catch(() => []);
      const list = (Array.isArray(loansRes) && loansRes.length > 0 ? loansRes : [
        { id: 'LN-APP-2026-05327', loanType: 'Business', sanctionedAmount: 200000, outstandingPrincipal: 200000, emiAmount: 9414, interestRate: 10.5, tenureMonths: 24, emisPaid: 0, nextEmiDate: '2026-08-05' },
        { id: 'LN-APP-2026-27758', loanType: 'Vehicle', sanctionedAmount: 1040800, outstandingPrincipal: 1040800, emiAmount: 62124, interestRate: 9.25, tenureMonths: 60, emisPaid: 0, nextEmiDate: '2026-08-10' }
      ]).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        type: `${l.loanType || 'Business'} Loan`,
        amount: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        nextEmi: l.emiAmount || 0,
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Aug 2026',
        progress: l.sanctionedAmount > 0 ? Math.round(((l.sanctionedAmount - l.outstandingPrincipal) / l.sanctionedAmount) * 100) : 16,
      }));

      setActiveLoans(list);
    } catch (err) {
      console.warn('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileIncomplete = userProfile && (!userProfile.panNumber || !userProfile.aadhaarNumber || !userProfile.monthlyIncome || !userProfile.addressLine1);

  // Timeline events for Recent Activity
  const activityTimeline = [
    { id: 1, title: 'EMI Payment Received', time: '05 Jul 2026', status: 'SUCCESS', desc: '₹12,750 credited for Home Loan' },
    { id: 2, title: 'Documents Verified', time: '01 Jul 2026', status: 'SUCCESS', desc: 'Salary slip & PAN card validated by officer' },
    { id: 3, title: 'Application Approved', time: '20 Jun 2026', status: 'SUCCESS', desc: 'Business Loan APP-2026-05327 sanctioned' },
    { id: 4, title: 'Loan Disbursed', time: '18 Jun 2026', status: 'SUCCESS', desc: '₹2,00,000 released to SBI account' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* INCOMPLETE PROFILE HEADING BANNER */}
      {isProfileIncomplete && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-md font-bold text-amber-400">⚠️ Profile Incomplete — Please Complete Your Profile Information</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your profile is missing required details. Completing your profile ensures your next loan application is pre-filled automatically!
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

      {/* 1. QUICK ACTIONS BAR AT THE TOP (REPLACED WELCOME BANNER) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-xs text-slate-500">Shortcuts to frequently used features</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          
          {/* Action 1: Apply Loan */}
          <button
            onClick={() => navigate(PATHS.BORROWER_APPLY)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left space-y-2 group transition-all"
          >
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg w-fit group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Apply Loan</p>
              <p className="text-[10px] text-slate-500">New loan application</p>
            </div>
          </button>

          {/* Action 2: Pay EMI */}
          <button
            onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left space-y-2 group transition-all"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Pay EMI</p>
              <p className="text-[10px] text-slate-500">Secure online payment</p>
            </div>
          </button>

          {/* Action 3: Download Statement */}
          <button
            onClick={() => navigate(PATHS.BORROWER_STATEMENTS)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left space-y-2 group transition-all"
          >
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg w-fit group-hover:scale-110 transition-transform">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Download Statement</p>
              <p className="text-[10px] text-slate-500">Tax & loan reports</p>
            </div>
          </button>

          {/* Action 4: Upload Documents */}
          <button
            onClick={() => navigate(PATHS.BORROWER_DOCUMENTS)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left space-y-2 group transition-all"
          >
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Upload Documents</p>
              <p className="text-[10px] text-slate-500">KYC & income files</p>
            </div>
          </button>

          {/* Action 5: Raise Query */}
          <button
            onClick={() => navigate(PATHS.BORROWER_PROFILE)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 rounded-xl text-left space-y-2 group transition-all col-span-2 sm:col-span-1"
          >
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg w-fit group-hover:scale-110 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Raise Query</p>
              <p className="text-[10px] text-slate-500">Support & help center</p>
            </div>
          </button>

        </div>
      </div>

      {/* 2. TOP 4 KPIs (Total Outstanding, Next EMI, Active Loans, Credit Score) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Total Outstanding */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : formatCurrency(summary.totalOutstanding, false)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Across {summary.activeLoansCount} active loans</p>
          </div>
        </div>

        {/* KPI 2: Next EMI Due */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next EMI Due</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
              {isLoading ? '...' : formatCurrency(summary.monthlyOutflow, false)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">On 05 Aug 2026</p>
          </div>
        </div>

        {/* KPI 3: Active Loans */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : summary.activeLoansCount}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Sanctioned & active</p>
          </div>
        </div>

        {/* KPI 4: Credit Health Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Credit Health</span>
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-teal-400">785</h2>
              <p className="text-xs text-slate-500 mt-1">Updated 20 Jul 2026</p>
            </div>
            <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded font-bold text-xs">Good</span>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Loan Portfolio Breakdown Chart (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-md font-bold text-white">Loan Portfolio Breakdown</h2>
            <Link to={PATHS.BORROWER_LOANS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              View All Loans →
            </Link>
          </div>

          <div className="space-y-6">
            {/* Outstanding Summary Gauge Cards */}
            <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray="84, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="16, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Outstanding</span>
                  <span className="text-sm font-extrabold text-white">{formatCurrency(summary.totalOutstanding, false)}</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-3 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-slate-300 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Vehicle Loan
                  </span>
                  <span className="font-mono text-white">₹10,40,800 (84%)</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-slate-300 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Business Loan
                  </span>
                  <span className="font-mono text-white">₹2,00,000 (16%)</span>
                </div>
              </div>
            </div>

            {/* Total Disbursed & Total Repaid Summary Bar */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Disbursed</span>
                  <span className="text-slate-200 font-bold">{formatCurrency(summary.totalDisbursed, false)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Repaid</span>
                  <span className="text-slate-200 font-bold">{formatCurrency(summary.totalRepaid, false)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Upcoming EMI Card & Recent Activity Timeline (6 columns) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Upcoming EMI Payments Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-white">Upcoming EMI Payments</h2>
              <Link to={PATHS.BORROWER_EMI_CALENDAR} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                View Calendar →
              </Link>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Business Loan EMI</h4>
                  <p className="text-xs text-slate-500">Auto-debit due on 05 Aug 2026</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                <span className="text-lg font-black text-emerald-400">₹9,414</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
                  className="mt-1"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline with Checkmarks */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" /> Recent Activity
              </h2>
              <Link to={PATHS.BORROWER_APPLICATIONS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                View All Activity →
              </Link>
            </div>

            <div className="space-y-3">
              {activityTimeline.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs border-b border-slate-850 pb-2.5 last:border-none">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-200 font-bold">{item.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
