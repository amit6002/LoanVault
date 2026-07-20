import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ChevronRight, Bell, Calendar, Activity, Coins, Plus, Download, Upload, HelpCircle, CreditCard, Shield, Wallet, FileText } from 'lucide-react';
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
 * BORROWER DASHBOARD COMPONENT
 * ============================================================
 */
export default function BorrowerDashboard() {
  const navigate = useNavigate();
  const { openHelpCenter } = useOutletContext() || {};
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const borrowerName = session.name || 'Rahul Sharma';

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
      // Artificial 1-second smooth loading animation to prevent abrupt layout shift / perceived lag
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
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

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const totalOutstanding = activeLoans.reduce((acc, l) => acc + l.outstandingPrincipal, 0);
  const totalDisbursed = loans.reduce((acc, l) => acc + l.sanctionedAmount, 0);
  const totalRepaid = loans.reduce((acc, l) => acc + (l.paidMonths * l.emiAmount), 0);

  const upcomingEmiLoan = activeLoans.find(l => !l.paidThisMonth) || activeLoans[0];
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

      {/* 1. QUICK ACTIONS BAR AT THE VERY TOP */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <button
            onClick={() => navigate(PATHS.BORROWER_APPLY)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Apply for Loan</p>
                <p className="text-[10px] text-slate-500">Get started now</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Pay EMI</p>
                <p className="text-[10px] text-slate-500">Make a payment</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => openHelpCenter ? openHelpCenter() : navigate(PATHS.BORROWER_PROFILE)}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 rounded-xl flex items-center justify-between group transition-all relative"
          >
            {ticketStore.getUnreadCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white font-bold text-[9px] shadow-lg animate-pulse">
                {ticketStore.getUnreadCount()} Unread
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Raise a Query</p>
                <p className="text-[10px] text-slate-500">We're here to help</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: TOTAL OUTSTANDING */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL OUTSTANDING</span>
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{formatCurrency(totalOutstanding, false)}</h2>
            <p className="text-xs text-slate-500 mt-1">Across {activeLoans.length} active loans</p>
          </div>
        </div>

        {/* KPI 2: NEXT EMI DUE */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NEXT EMI DUE</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
              {upcomingEmiLoan && !upcomingEmiLoan.paidThisMonth ? formatCurrency(upcomingEmiLoan.emiAmount) : 'PAID ✓'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {upcomingEmiLoan && !upcomingEmiLoan.paidThisMonth ? `On ${upcomingEmiLoan.dueDateLabel}` : 'All EMIs paid for this month'}
            </p>
          </div>
        </div>

        {/* KPI 3: ACTIVE LOANS */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE LOANS</span>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{activeLoans.length}</h2>
            <p className="text-xs text-slate-500 mt-1">Total Active Accounts</p>
          </div>
        </div>

        {/* KPI 4: CREDIT HEALTH GAUGE */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CREDIT HEALTH</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center pt-1">
            <svg className="w-32 h-16" viewBox="0 0 100 50">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#gradientGaugeDashboardTop)"
                strokeWidth="10"
                strokeDasharray="125 125"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradientGaugeDashboardTop" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center -mt-5">
              <span className="text-xl font-black text-white block">785</span>
              <span className="text-[10px] font-bold text-emerald-400">Good</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN WORKSPACE DIVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Widget: Loan Portfolio Doughnut Breakdown (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-md font-bold text-white">Loan Portfolio</h2>
            <Link to={PATHS.BORROWER_LOANS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              View All Loans →
            </Link>
          </div>

          <div className="space-y-6">
            <div className="relative flex items-center justify-center mx-auto w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" strokeDasharray="84, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="16, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] font-extrabold text-white block">{formatCurrency(totalOutstanding, false)}</span>
                <span className="text-[9px] font-semibold text-slate-400">Total Outstanding</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {activeLoans.map(loan => (
                <div key={loan.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`h-2.5 w-2.5 rounded-full ${loan.name.includes('Business') ? 'bg-blue-500' : 'bg-emerald-500'}`} /> {loan.name}
                  </span>
                  <span className="font-mono text-slate-300 font-bold">{formatCurrency(loan.outstandingPrincipal, false)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Disbursed</span>
                  <span className="text-slate-200 font-bold">{formatCurrency(totalDisbursed, false)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Repaid</span>
                  <span className="text-slate-200 font-bold">{formatCurrency(totalRepaid, false)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Widget: Upcoming EMI Card (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-md font-bold text-white">Upcoming EMI</h2>
            <Link to={PATHS.BORROWER_EMI_CALENDAR} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View Calendar →
            </Link>
          </div>

          {upcomingEmiLoan ? (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4 relative">
              <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded ${
                upcomingEmiLoan.paidThisMonth ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                {upcomingEmiLoan.paidThisMonth ? 'PAID' : 'Due Soon'}
              </span>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                  <Landmark className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{upcomingEmiLoan.name}</h3>
                  <p className="text-xs text-slate-500">Monthly Installment</p>
                </div>
              </div>

              <div>
                <p className="text-2xl font-black text-white">{formatCurrency(upcomingEmiLoan.emiAmount)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Due on {upcomingEmiLoan.dueDateLabel}</p>
              </div>

              {upcomingEmiLoan.paidThisMonth ? (
                <div className="w-full text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs">
                  ✓ EMI Paid for August 2026
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5"
                  onClick={() => handlePayEmiNow(upcomingEmiLoan.id)}
                  isLoading={isPaying}
                >
                  Pay EMI Now
                </Button>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">All EMIs Paid! 🎉</p>
            </div>
          )}
        </div>

        {/* Right Widget: Recent Activity List (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-md font-bold text-white">Recent Activity</h2>
            <Link to={PATHS.BORROWER_APPLICATIONS} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View All Activity →
            </Link>
          </div>

          <div className="space-y-4 text-xs">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full mt-0.5 ${t.type === 'DEBIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {t.type === 'DEBIT' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Coins className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-500">{t.date}</p>
                  </div>
                </div>
                <span className={`font-bold font-mono ${t.type === 'DEBIT' ? 'text-emerald-400' : 'text-emerald-400'}`}>
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
