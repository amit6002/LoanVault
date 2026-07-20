import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, CreditCard, Download, ShieldCheck, List, Layers, Landmark } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * EMI & PAYMENTS PAGE COMPONENT (Borrower Portal)
 * Purpose: Secure EMI repayment management & auto-debit mandates.
 * Top KPIs: Next EMI, Auto Debit, Total Paid This Year, Overdue.
 * Tabs: Upcoming, History, Auto Debit ("All Payments" removed).
 * Includes optional Calendar View mode toggle.
 * ============================================================
 */
export default function EMICalendarPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const upcomingPayments = [
    { id: 'PAY-901', name: 'Business Loan EMI', amount: 9414, dueDate: '05 Aug 2026', loanId: 'LN-APP-2026-05327', status: 'DUE_SOON' },
    { id: 'PAY-902', name: 'Vehicle Loan EMI', amount: 62124, dueDate: '10 Aug 2026', loanId: 'LN-APP-2026-27758', status: 'UPCOMING' },
  ];

  const paymentHistory = [
    { id: 'TXN-8012', name: 'Business Loan EMI', amount: 9414, paidDate: '05 Jul 2026', refNo: 'PAY-REF-90812', receiptId: 'RCP-7819' },
    { id: 'TXN-7911', name: 'Vehicle Loan EMI', amount: 62124, paidDate: '10 Jul 2026', refNo: 'PAY-REF-89102', receiptId: 'RCP-7411' },
    { id: 'TXN-7210', name: 'Business Loan EMI', amount: 9414, paidDate: '05 Jun 2026', refNo: 'PAY-REF-78119', receiptId: 'RCP-6910' },
  ];

  const handlePayNow = (item) => {
    setIsPaying(true);
    setPaymentSuccessMsg('');
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccessMsg(`EMI Payment of ${formatCurrency(item.amount)} for ${item.name} completed successfully! Receipt generated.`);
    }, 1200);
  };

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

      {/* 2. TOP 4 KPI CARDS (Next EMI, Auto Debit, Total Paid This Year, Overdue) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Next EMI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase">Next EMI</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Clock className="h-4 w-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-emerald-400">₹9,414</h2>
          <p className="text-xs text-slate-500">Due on 05 Aug 2026</p>
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
          <h2 className="text-2xl font-black text-white">₹1,600,800</h2>
          <p className="text-xs text-slate-500">12 EMIs cleared</p>
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
          
          {/* Tabs: Upcoming, History, Auto Debit (Removed "All Payments") */}
          <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
            {['Upcoming', 'History', 'Auto Debit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-all ${
                  activeTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: UPCOMING PAYMENTS LIST */}
          {activeTab === 'Upcoming' && (
            <div className="space-y-4">
              {upcomingPayments.map(item => (
                <div key={item.id} className="p-5 bg-slate-950/60 border border-slate-850 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500">Ref: {item.loanId}</span>
                    <h3 className="text-md font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">Due Date: <span className="text-amber-400 font-semibold">{item.dueDate}</span></p>
                  </div>

                  <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-400 block">{formatCurrency(item.amount)}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                        {item.status === 'DUE_SOON' ? 'Due Soon' : 'Upcoming'}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePayNow(item)}
                      isLoading={isPaying}
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HISTORY LIST */}
          {activeTab === 'History' && (
            <div className="space-y-4">
              {paymentHistory.map(item => (
                <div key={item.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-500">Paid on {item.paidDate} • Ref: {item.refNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-400 text-sm">{formatCurrency(item.amount)}</span>
                    <Button variant="secondary" size="sm" leftIcon={Download} onClick={() => alert(`Downloading receipt ${item.receiptId}`)}>
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
                  {isDueDay && <span className="text-[9px] font-extrabold text-white block">₹9,414</span>}
                  {isVehicleDay && <span className="text-[9px] font-extrabold text-emerald-400 block">₹62,124</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
