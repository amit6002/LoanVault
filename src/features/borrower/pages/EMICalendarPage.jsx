import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, CreditCard, 
  Download, ShieldCheck, List, Layers, Landmark 
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { loanStore } from '../../../utils/loanStore';
import Button from '../../../components/common/Button';
import PageSkeletonLoader from '../../../components/common/PageSkeletonLoader';

/**
 * ============================================================
 * EMI & PAYMENTS PAGE COMPONENT (LIGHT THEME)
 * Tracks payment schedules, auto-debit mandates, and history.
 * ============================================================
 */
export default function EMICalendarPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [viewMode, setViewMode] = useState('list');
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const storedLoans = loanStore.getLoans();
    const storedTxns = loanStore.getTransactions();
    setLoans(storedLoans);
    setTransactions(storedTxns);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handlePayNow = (loanId) => {
    setIsPaying(true);
    setPaymentSuccessMsg('');
    setTimeout(() => {
      const { loans: updatedLoans, txns: updatedTxns } = loanStore.payEmi(loanId);
      setLoans(updatedLoans);
      setTransactions(updatedTxns);
      setIsPaying(false);

      const paidLoan = updatedLoans.find((l) => l.id === loanId);
      setPaymentSuccessMsg(
        `EMI Payment of ${formatCurrency(paidLoan.emiAmount)} for ${paidLoan.name} completed successfully! Loan balance updated.`
      );
    }, 800);
  };

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const upcomingPayments = activeLoans.filter((l) => !l.paidThisMonth);
  const totalPaidThisYear = loans.reduce((acc, l) => acc + l.paidMonths * l.emiAmount, 0);
  const nextEmiLoan = upcomingPayments[0] || activeLoans[0];

  if (isLoading) {
    return <PageSkeletonLoader title="Loading Upcoming EMIs & Payment Schedules..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">EMI & Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pay installments securely, track payment history, and manage auto-debit mandates.
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="h-4 w-4" /> List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-4 w-4" /> Calendar View
          </button>
        </div>
      </div>

      {/* Payment Success Alert */}
      {paymentSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{paymentSuccessMsg}</span>
        </div>
      )}

      {/* 2. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Next EMI */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next EMI</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-emerald-600">
            {nextEmiLoan && !nextEmiLoan.paidThisMonth ? formatCurrency(nextEmiLoan.emiAmount) : 'Paid ✓'}
          </h2>
          <p className="text-xs text-slate-500">
            {nextEmiLoan && !nextEmiLoan.paidThisMonth ? `Due on ${nextEmiLoan.dueDateLabel}` : 'All EMIs paid for this cycle'}
          </p>
        </div>

        {/* Auto Debit Status */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto Debit Mandate</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Active</h2>
          <p className="text-xs text-slate-500">SBI A/C ****4910</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Repaid</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{formatCurrency(totalPaidThisYear, false)}</h2>
          <p className="text-xs text-slate-500">EMIs cleared to date</p>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue</span>
            <div className="p-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-emerald-600">₹0</h2>
          <p className="text-xs text-slate-500">Zero overdue fees</p>
        </div>
      </div>

      {/* 3. LIST VIEW VS CALENDAR VIEW */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 overflow-x-auto pb-1">
            {['Upcoming', 'History', 'Auto Debit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab} {tab === 'Upcoming' && `(${upcomingPayments.length})`}
              </button>
            ))}
          </div>

          {/* TAB 1: UPCOMING PAYMENTS LIST */}
          {activeTab === 'Upcoming' && (
            <div className="space-y-4">
              {upcomingPayments.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h4 className="text-md font-bold text-slate-900">All EMIs Paid for Current Cycle! 🎉</h4>
                  <p className="text-xs text-slate-500">You have no pending installments due right now.</p>
                </div>
              ) : (
                upcomingPayments.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-slate-400">Loan ID: {item.id}</span>
                      <h3 className="text-md font-bold text-slate-900">{item.name}</h3>
                      <p className="text-xs text-slate-500">
                        Due Date: <span className="text-amber-700 font-bold">{item.dueDateLabel}</span>
                      </p>
                    </div>

                    <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900 block">
                          {formatCurrency(item.emiAmount)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Due Soon
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePayNow(item.id)}
                        isLoading={isPaying}
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: HISTORY LIST */}
          {activeTab === 'History' && (
            <div className="space-y-3">
              {transactions
                .filter((t) => t.type === 'DEBIT')
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <p className="text-[10px] text-slate-500">Paid on {t.date} • Ref: {t.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-700 text-sm">-{formatCurrency(t.amount)}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={Download}
                        onClick={() => alert(`Downloading receipt for ${t.id}`)}
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 3: AUTO DEBIT MANDATE */}
          {activeTab === 'Auto Debit' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" /> Active NACH Auto-Debit Mandate
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
                    <span className="text-slate-900 font-bold">State Bank of India</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Number</span>
                    <span className="text-slate-900 font-mono font-bold">XXXX-XXXX-4910</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mandate Status</span>
                    <span className="text-emerald-700 font-bold">ACTIVE & VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-md font-bold text-slate-900">Payment Schedule</h3>
            <span className="text-xs text-slate-500">Highlighted dates show upcoming installments</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2 font-bold text-slate-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isDueDay = day === 5;
              const isVehicleDay = day === 10;

              return (
                <div
                  key={day}
                  className={`p-3 rounded-xl border text-center font-bold flex flex-col justify-between h-16 ${
                    isDueDay
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : isVehicleDay
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 border-slate-200/60 text-slate-600'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {isDueDay && <span className="text-[9px] font-black text-white block">₹9,414.69</span>}
                  {isVehicleDay && <span className="text-[9px] font-black text-emerald-700 block">₹9,249.71</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
