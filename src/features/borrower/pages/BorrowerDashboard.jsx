import { useState, useEffect } from 'react';
import { 
  Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, 
  ChevronRight, Bell, Calendar, Activity, Coins, Plus, Download, Upload, 
  HelpCircle, CreditCard, Shield, Wallet, FileText 
} from 'lucide-react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import { loanStore } from '../../../utils/loanStore';
import { ticketStore } from '../../../utils/ticketStore';
import Button from '../../../components/common/Button';
import PageSkeletonLoader from '../../../components/common/PageSkeletonLoader';

/**
 * ============================================================
 * BORROWER DASHBOARD COMPONENT (LIGHT THEME)
 * Clean overview with progressive disclosure & KPI cards
 * ============================================================
 */
export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const { openHelpCenter } = useOutletContext() || {};
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');

  const [userProfile, setUserProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await api.get('/api/user/profile').catch(() => null);
      if (profileRes) {
        setUserProfile(profileRes);
      }

      const storedLoans = loanStore.getLoans();
      const storedTxns = loanStore.getTransactions();
      setLoans(storedLoans);
      setTransactions(storedTxns);
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  };

  const handlePayEmiNow = (loanId) => {
    setIsPaying(true);
    setTimeout(() => {
      const { loans: updatedLoans, txns: updatedTxns } = loanStore.payEmi(loanId);
      setLoans(updatedLoans);
      setTransactions(updatedTxns);
      setIsPaying(false);
    }, 600);
  };

  if (isLoading) {
    return <PageSkeletonLoader title="Loading Loan Portfolio & Account Summary..." />;
  }

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const totalOutstanding = activeLoans.reduce((acc, l) => acc + l.outstandingPrincipal, 0);
  const totalDisbursed = loans.reduce((acc, l) => acc + l.sanctionedAmount, 0);
  const totalRepaid = loans.reduce((acc, l) => acc + l.paidMonths * l.emiAmount, 0);

  const upcomingEmiLoan = activeLoans.find((l) => !l.paidThisMonth) || activeLoans[0];
  const isProfileIncomplete =
    userProfile &&
    (!userProfile.panNumber || !userProfile.aadhaarNumber || !userProfile.monthlyIncome || !userProfile.addressLine1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* INCOMPLETE PROFILE HEADING BANNER */}
      {isProfileIncomplete && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Profile Incomplete — Action Required</h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Completing your KYC profile pre-fills your loan applications automatically.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(PATHS.BORROWER_PROFILE)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap"
          >
            Complete Profile
          </Button>
        </div>
      )}

      {/* 1. QUICK ACTIONS BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <button
            onClick={() => navigate(PATHS.BORROWER_APPLY)}
            className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/30 rounded-xl flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Apply for Loan</p>
                <p className="text-[11px] text-slate-500">Get instant approval</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
            className="p-4 bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/30 rounded-xl flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Pay EMI</p>
                <p className="text-[11px] text-slate-500">Make installment payment</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate(PATHS.BORROWER_SUPPORT)}
            className="p-4 bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 rounded-xl flex items-center justify-between group transition-all relative cursor-pointer"
          >
            {ticketStore.getUnreadCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] shadow-xs animate-pulse">
                {ticketStore.getUnreadCount()} Unread
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Help Center</p>
                <p className="text-[11px] text-slate-500">Connect with officer</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: TOTAL OUTSTANDING */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{formatCurrency(totalOutstanding, false)}</h2>
            <p className="text-xs text-slate-500 mt-1">Across {activeLoans.length} active loans</p>
          </div>
        </div>

        {/* KPI 2: NEXT EMI DUE */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next EMI Due</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-600">
              {upcomingEmiLoan && !upcomingEmiLoan.paidThisMonth ? formatCurrency(upcomingEmiLoan.emiAmount) : 'Paid ✓'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {upcomingEmiLoan && !upcomingEmiLoan.paidThisMonth ? `On ${upcomingEmiLoan.dueDateLabel}` : 'All EMIs paid for this month'}
            </p>
          </div>
        </div>

        {/* KPI 3: ACTIVE LOANS */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{activeLoans.length}</h2>
            <p className="text-xs text-slate-500 mt-1">Total Active Accounts</p>
          </div>
        </div>

        {/* KPI 4: CREDIT HEALTH GAUGE */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 flex flex-col justify-between shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credit Health</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center pt-1">
            <svg className="w-32 h-16" viewBox="0 0 100 50">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#gradientGaugeDashboardTopLight)"
                strokeWidth="10"
                strokeDasharray="125 125"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradientGaugeDashboardTopLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center -mt-5">
              <span className="text-xl font-black text-slate-900 block">785</span>
              <span className="text-[10px] font-bold text-emerald-600">Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE DIVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Widget: Loan Portfolio Breakdown (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-md font-bold text-slate-900">Loan Portfolio</h2>
            <Link to={PATHS.BORROWER_LOANS} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
              View All →
            </Link>
          </div>

          <div className="space-y-6">
            <div className="relative flex items-center justify-center mx-auto w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600" strokeDasharray="84, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="16, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-black text-slate-900 block">{formatCurrency(totalOutstanding, false)}</span>
                <span className="text-[10px] font-semibold text-slate-500">Outstanding</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className={`h-2.5 w-2.5 rounded-full ${loan.name.includes('Business') ? 'bg-indigo-600' : 'bg-emerald-500'}`} /> {loan.name}
                  </span>
                  <span className="font-mono text-slate-900 font-bold">{formatCurrency(loan.outstandingPrincipal, false)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Disbursed</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(totalDisbursed, false)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Repaid</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(totalRepaid, false)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Widget: Upcoming EMI Card (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-md font-bold text-slate-900">Upcoming EMI</h2>
            <Link to={PATHS.BORROWER_EMI_CALENDAR} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">
              Calendar →
            </Link>
          </div>

          {upcomingEmiLoan ? (
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 relative">
              <span
                className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  upcomingEmiLoan.paidThisMonth ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {upcomingEmiLoan.paidThisMonth ? 'PAID' : 'Due Soon'}
              </span>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{upcomingEmiLoan.name}</h3>
                  <p className="text-xs text-slate-500">Monthly Installment</p>
                </div>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(upcomingEmiLoan.emiAmount)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Due on {upcomingEmiLoan.dueDateLabel}</p>
              </div>

              {upcomingEmiLoan.paidThisMonth ? (
                <div className="w-full text-center py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-xs">
                  ✓ EMI Paid for Current Cycle
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5"
                  onClick={() => handlePayEmiNow(upcomingEmiLoan.id)}
                  isLoading={isPaying}
                >
                  Pay EMI Now
                </Button>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">All EMIs Paid! 🎉</p>
            </div>
          )}
        </div>

        {/* Right Widget: Recent Activity List (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-md font-bold text-slate-900">Recent Activity</h2>
            <Link to={PATHS.BORROWER_APPLICATIONS} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">
              View All →
            </Link>
          </div>

          <div className="space-y-3.5 text-xs">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-start justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-lg mt-0.5 ${
                      t.type === 'DEBIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {t.type === 'DEBIT' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Coins className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[10px] text-slate-500">{t.date}</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-emerald-600">
                  {t.type === 'DEBIT' ? '-' : '+'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
