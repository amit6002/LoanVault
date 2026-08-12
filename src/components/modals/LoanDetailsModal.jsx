import { useState } from 'react';
import { Calendar, DollarSign, CheckCircle2, Clock, Zap, Download, FileText, BarChart2, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Modal from './Modal';

/**
 * ============================================================
 * LOAN DETAILS MODAL COMPONENT
 * 3-tab premium modal: Overview · Payment Schedule · Documents
 * ============================================================
 */
export default function LoanDetailsModal({ isOpen = false, onClose, loan }) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!loan) return null;

  const paidEMIs       = loan.paidMonths     || 0;
  const totalMonths    = loan.tenureMonths   || 12;
  const remainingMonths = totalMonths - paidEMIs;
  const progressPercent = Math.min((paidEMIs / totalMonths) * 100, 100);

  const emiAmount         = loan.emiAmount          || 5000;
  const sanctionedAmount  = loan.sanctionedAmount   || 500000;
  const outstandingAmount = loan.outstandingPrincipal || Math.max(sanctionedAmount - paidEMIs * emiAmount * 0.6, 0);

  // Build a simplified amortization schedule
  const baseDate = loan.disbursalDate ? new Date(loan.disbursalDate) : new Date();
  const amortizationSchedule = Array.from({ length: totalMonths }, (_, i) => {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    return {
      month: i + 1,
      isPaid: i < paidEMIs,
      emiAmount,
      principalPortion: Math.round(emiAmount * 0.62),
      interestPortion:  Math.round(emiAmount * 0.38),
      dueDate,
    };
  });

  const tabs = [
    { id: 'summary',   label: 'Overview',         icon: BarChart2 },
    { id: 'schedule',  label: 'Payment Schedule',  icon: Calendar  },
    { id: 'documents', label: 'Documents',         icon: FileText  },
  ];

  const documents = [
    { name: 'Loan Agreement',               icon: '📄', date: loan.disbursalDate ? new Date(loan.disbursalDate).toLocaleDateString() : 'N/A' },
    { name: 'Disbursement Certificate',     icon: '✅', date: loan.disbursalDate ? new Date(loan.disbursalDate).toLocaleDateString() : 'N/A' },
    { name: 'NOC (No Objection Certificate)', icon: '📋', date: 'Available after closure' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Loan Account #${(loan.loanId || 'N/A').slice(-6).toUpperCase()}`}
      size="lg"
      showCloseButton
    >
      <div className="flex flex-col h-full">

        {/* Tab Navigation */}
        <div className="flex-shrink-0 border-b border-slate-200/50 px-8 bg-white">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 font-semibold text-sm border-b-2 transition-smooth-fast ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-indigo-600'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Loan Amount',    value: formatCurrency(sanctionedAmount),    from: 'from-indigo-50', to: 'to-indigo-100/50', border: 'border-indigo-200', text: 'text-indigo-900', labelColor: 'text-indigo-600' },
                  { label: 'EMI Amount',     value: formatCurrency(emiAmount),           from: 'from-emerald-50', to: 'to-emerald-100/50', border: 'border-emerald-200', text: 'text-emerald-900', labelColor: 'text-emerald-600' },
                  { label: 'Interest Rate',  value: `${loan.interestRate || 9.5}%`,      from: 'from-amber-50',  to: 'to-amber-100/50',  border: 'border-amber-200',  text: 'text-amber-900',  labelColor: 'text-amber-600' },
                  { label: 'Tenure',         value: `${totalMonths} mo.`,               from: 'from-purple-50', to: 'to-purple-100/50', border: 'border-purple-200', text: 'text-purple-900', labelColor: 'text-purple-600' },
                ].map((kpi) => (
                  <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} p-4 rounded-2xl border ${kpi.border}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider ${kpi.labelColor}`}>{kpi.label}</div>
                    <div className={`text-xl font-black mt-1.5 ${kpi.text}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Repayment Progress</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{paidEMIs} of {totalMonths} EMIs paid</p>
                  </div>
                  <div className="text-2xl font-black text-indigo-600">{Math.round(progressPercent)}%</div>
                </div>
                <div className="progress-bar-indigo">
                  <div style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Calendar,   label: 'Disbursement Date',  value: loan.disbursalDate ? new Date(loan.disbursalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
                  { icon: Zap,        label: 'Loan Status',        value: (loan.status || 'ACTIVE').charAt(0) + (loan.status || 'ACTIVE').slice(1).toLowerCase(), isStatus: true },
                  { icon: DollarSign, label: 'Outstanding Balance', value: formatCurrency(outstandingAmount) },
                  { icon: Clock,      label: 'Months Remaining',   value: `${remainingMonths} months` },
                ].map(({ icon: Icon, label, value, isStatus }) => (
                  <div key={label} className="p-4 rounded-xl border border-slate-200 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                    </div>
                    {isStatus ? (
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${loan.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse-glow' : 'bg-slate-400'}`} />
                        <p className="text-sm font-bold text-slate-900">{value}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-600" />
                  Financial Summary
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Total Amount Disbursed', value: formatCurrency(sanctionedAmount), color: 'text-slate-900' },
                    { label: 'Total Amount Repaid',    value: formatCurrency(paidEMIs * emiAmount), color: 'text-emerald-600' },
                    { label: 'Outstanding Balance',    value: formatCurrency(outstandingAmount),    color: 'text-amber-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                  <div className="h-px bg-slate-300 my-1" />
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-900">Total Interest Payable</span>
                    <span className="text-indigo-600">
                      {formatCurrency(Math.max(emiAmount * totalMonths - sanctionedAmount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <div className="space-y-5 animate-fade-in">
              {/* Legend */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Paid
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Pending
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-12 gap-2">
                {amortizationSchedule.map((payment) => (
                  <div key={payment.month} className="relative group">
                    <div
                      className={`aspect-square flex items-center justify-center rounded-lg font-bold text-[11px] cursor-default transition-smooth-fast ${
                        payment.isPaid
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {payment.month}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white rounded-xl whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                      Month {payment.month}: {formatCurrency(payment.emiAmount)}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Month</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">EMI</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Principal</th>
                      <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Interest</th>
                      <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {amortizationSchedule.slice(0, 12).map((payment) => (
                      <tr
                        key={payment.month}
                        className={`hover:bg-slate-50/80 transition-colors ${payment.isPaid ? 'bg-emerald-50/30' : 'bg-white'}`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">Month {payment.month}</td>
                        <td className="text-right py-3 px-4 font-semibold text-slate-900">{formatCurrency(payment.emiAmount)}</td>
                        <td className="text-right py-3 px-4 text-slate-500">{formatCurrency(payment.principalPortion)}</td>
                        <td className="text-right py-3 px-4 text-slate-500">{formatCurrency(payment.interestPortion)}</td>
                        <td className="text-center py-3 px-4">
                          {payment.isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 className="h-3 w-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'documents' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm text-slate-500 mb-4">Loan-related documents are available for download below.</p>
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-smooth-fast group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/60 flex items-center justify-center text-2xl border border-slate-200 shadow-sm">
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{doc.date}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 opacity-0 group-hover:opacity-100 transition-smooth-fast shadow-md shadow-indigo-600/20">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
