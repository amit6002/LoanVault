import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, CreditCard, Download, ShieldCheck, List, Layers, Landmark } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { loanStore } from '../../../utils/loanStore';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * EMI & PAYMENTS PAGE COMPONENT (Borrower Portal)
 * Integrates with central loanStore.
 * Shows all active loan EMIs in Upcoming (e.g. Business Loan & Vehicle Loan).
 * Clicking "Pay Now" deducts loan balance, marks EMI as paid, and moves it to History!
 * ============================================================
 */
export default function EMICalendarPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [viewMode, setViewMode] = useState('list');
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedLoans = loanStore.getLoans();
    const storedTxns = loanStore.getTransactions();
    setLoans(storedLoans);
    setTransactions(storedTxns);
  };

  const handlePayNow = (loanId) => {
    setIsPaying(true);
    setPaymentSuccessMsg('');
    setTimeout(() => {
      const { loans: updatedLoans, txns: updatedTxns } = loanStore.payEmi(loanId);
      setLoans(updatedLoans);
      setTransactions(updatedTxns);
      setIsPaying(false);

      const paidLoan = updatedLoans.find(l => l.id === loanId);
      setPaymentSuccessMsg(`EMI Payment of ${formatCurrency(paidLoan.emiAmount)} for ${paidLoan.name} completed successfully! Loan balance updated.`);
    }, 800);
  };

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const upcomingPayments = activeLoans.filter(l => !l.paidThisMonth);
  const totalPaidThisYear = loans.reduce((acc, l) => acc + (l.paidMonths * l.emiAmount), 0);
  const nextEmiLoan = upcomingPayments[0] || activeLoans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">EMI & Payments</h1>
          <p className="text-sm text-slate-400 mt-1">Pay installments securely, track payment history, and manage auto-debit mandates.</p>
        </div>

        {/* Optional View Mode Toggle Button */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="h-4 w-4" /> List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="h-4 w-4" /> Calendar View
          </button>
        </div>
      </div>

      {/* Payment Success Alert */}
      {paymentSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* 2. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Next EMI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase">Next EMI</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Clock className="h-4 w-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-emerald-400">
            {nextEmiLoan && !nextEmiLoan.paidThisMonth ? formatCurrency(nextEmiLoan.emiAmount) : 'PAID ✓'}
          </h2>
          <p className="text-xs text-slate-500">
            {nextEmiLoan && !nextEmiLoan.paidThisMonth ? `Due on ${nextEmiLoan.dueDateLabel}` : 'No due EMIs for August 2026'}
          </p>
        </div>

        {/* Auto Debit Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase">Auto Debit Mandate</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck className="h-4 w-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-white">Active</h2>
          <p className="text-xs text-slate-500">SBI A/C ****4910</p>
        </div>

        {/* Total Paid This Year */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Paid (2026)</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Landmark className="h-4 w-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-white">{formatCurrency(totalPaidThisYear, false)}</h2>
          <p className="text-xs text-slate-500">EMIs cleared</p>
        </div>

        {/* Overdue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overdue Amount</span>
            <div className="p-2 bg-slate-800 text-slate-400 rounded-lg"><AlertCircle className="h-4 w-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-emerald-400">₹0</h2>
          <p className="text-xs text-slate-500">Zero overdue charges</p>
        </div>

      </div>

      {/* 3. LIST VIEW VS CALENDAR VIEW */}
      {viewMode === 'list' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          
          {/* Tabs: Upcoming, History, Auto Debit */}
          <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
            {['Upcoming', 'History', 'Auto Debit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab} {tab === 'Upcoming' && `(${upcomingPayments.length})`}
              </button>
            ))}
          </div>

          {/* TAB 1: UPCOMING PAYMENTS LIST (Renders 2 EMIs if 2 active loans exist) */}
          {activeTab === 'Upcoming' && (
            <div className="space-y-4">
              {upcomingPayments.length === 0 ? (
                <div className="p-8 bg-slate-950/60 border border-slate-850 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-md font-bold text-white">All EMIs Paid for August 2026! 🎉</h4>
                  <p className="text-xs text-slate-400">You have no pending installments due this month.</p>
                </div>
              ) : (
                upcomingPayments.map(item => (
                  <div key={item.id} className="p-5 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-slate-500">Loan ID: {item.id}</span>
                      <h3 className="text-md font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400">Due Date: <span className="text-amber-400 font-semibold">{item.dueDateLabel}</span></p>
                    </div>

                    <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400 block">{formatCurrency(item.emiAmount)}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
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
            <div className="space-y-4">
              {transactions.filter(t => t.type === 'DEBIT').map(t => (
                <div key={t.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] text-slate-500">Paid on {t.date} • Ref: {t.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-400 text-sm">-{formatCurrency(t.amount)}</span>
                    <Button variant="secondary" size="sm" leftIcon={Download} onClick={() => alert(`Downloading receipt for ${t.id}`)}>
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AUTO DEBIT MANDATE SETUP */}
          {activeTab === 'Auto Debit' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" /> Active NACH Auto-Debit Mandate
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Bank Name</span>
                    <span className="text-white font-bold">State Bank of India</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number</span>
                    <span className="text-white font-mono">XXXX-XXXX-4910</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mandate Status</span>
                    <span className="text-emerald-400 font-bold">ACTIVE & VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* OPTIONAL CALENDAR VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-md font-bold text-white">August 2026 Payment Schedule</h3>
            <span className="text-xs text-slate-400">Click a highlighted date to inspect payment details</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 font-bold text-slate-500">{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const isDueDay = day === 5;
              const isVehicleDay = day === 10;

              return (
                <div
                  key={day}
                  className={`p-4 rounded-xl border text-center font-bold flex flex-col justify-between h-16 ${
                    isDueDay
                      ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/50'
                      : isVehicleDay
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {isDueDay && <span className="text-[9px] font-extrabold text-white block">₹9,414.69</span>}
                  {isVehicleDay && <span className="text-[9px] font-extrabold text-emerald-400 block">₹9,249.71</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
