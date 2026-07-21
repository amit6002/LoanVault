import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, ArrowRight, Download, CreditCard, ChevronRight, CheckCircle2, 
  FileText, Search, Plus, Calendar, Coins, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { loanStore } from '../../../utils/loanStore';
import Button from '../../../components/common/Button';
import PageSkeletonLoader from '../../../components/common/PageSkeletonLoader';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT (LIGHT THEME)
 * Progressive master-detail layout with collapsible schedule inspectors.
 * ============================================================
 */
export default function MyLoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('LN-APP-2026-05327');
  const [detailTab, setDetailTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentMsg, setPaymentMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const storedLoans = loanStore.getLoans();
    const storedTxns = loanStore.getTransactions();
    setLoans(storedLoans);
    setTransactions(storedTxns);
    if (storedLoans.length > 0 && !storedLoans.some((l) => l.id === activeTab)) {
      setActiveTab(storedLoans[0].id);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handlePayEmiNow = (loanId) => {
    const { loans: updatedLoans, txns: updatedTxns } = loanStore.payEmi(loanId);
    setLoans(updatedLoans);
    setTransactions(updatedTxns);

    const paidLoan = updatedLoans.find((l) => l.id === loanId);
    setPaymentMsg(
      `EMI Payment of ${formatCurrency(paidLoan.emiAmount)} for ${paidLoan.name} processed successfully! Balance updated.`
    );
    setTimeout(() => setPaymentMsg(''), 5000);
  };

  const filteredLoans = loans.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return l.status === 'ACTIVE';
    return true;
  });

  const selectedLoan = loans.find((l) => l.id === activeTab) || loans[0];
  const loanTxns = selectedLoan ? transactions.filter((t) => t.loanId === selectedLoan.id) : [];

  if (isLoading) {
    return <PageSkeletonLoader title="Loading Loan Accounts & Amortization Schedules..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Loan Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active loans, EMI schedules, and repayment history</p>
        </div>

        <Button variant="primary" leftIcon={Plus} onClick={() => navigate(PATHS.BORROWER_APPLY)}>
          Apply for New Loan
        </Button>
      </div>

      {paymentMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{paymentMsg}</span>
        </div>
      )}

      {/* MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: MASTER LIST (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search bar + filter dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search loan accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Loans</option>
              <option value="ACTIVE">Active Loans</option>
            </select>
          </div>

          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Loan Accounts ({filteredLoans.length})
          </h2>

          {/* Loan Cards List */}
          {filteredLoans.map((loan) => {
            const isSelected = activeTab === loan.id;
            const progressPct =
              loan.sanctionedAmount > 0
                ? Math.round(((loan.sanctionedAmount - loan.outstandingPrincipal) / loan.sanctionedAmount) * 100)
                : 0;

            return (
              <div
                key={loan.id}
                onClick={() => setActiveTab(loan.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{loan.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">ID: {loan.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      loan.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Outstanding</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(loan.outstandingPrincipal, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Next EMI</span>
                    <span className="text-slate-900 font-bold">
                      {loan.paidThisMonth ? 'PAID ✓' : loan.emiAmount > 0 ? formatCurrency(loan.emiAmount) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                    <span className="text-slate-700 font-semibold">{loan.dueDateLabel}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Paid</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: WORKSPACE DETAILS (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          {selectedLoan ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      {selectedLoan.name}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedLoan.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Loan Account: {selectedLoan.id}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 overflow-x-auto pb-1">
                {['Overview', 'EMI Schedule', 'Transactions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${
                      detailTab === tab
                        ? 'border-indigo-600 text-indigo-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {detailTab === 'Overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Loan Summary Parameters */}
                    <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
                        Loan Parameters
                      </h4>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Sanctioned Amount</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(selectedLoan.sanctionedAmount, false)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Outstanding Balance</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(selectedLoan.outstandingPrincipal, false)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Interest Rate</span>
                        <span className="text-emerald-700 font-bold">{selectedLoan.interestRate}% p.a.</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Tenure</span>
                        <span className="text-slate-700 font-semibold">{selectedLoan.tenureMonths} Months</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Monthly EMI</span>
                        <span className="text-indigo-600 font-bold">{formatCurrency(selectedLoan.emiAmount)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">EMIs Paid</span>
                        <span className="text-slate-700 font-bold">
                          {selectedLoan.paidMonths} of {selectedLoan.tenureMonths}
                        </span>
                      </div>

                      {/* PAY EMI NOW BUTTON */}
                      {selectedLoan.status === 'ACTIVE' &&
                        (selectedLoan.paidThisMonth ? (
                          <div className="w-full text-center mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-xl text-xs">
                            ✓ EMI Paid for Current Month
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full justify-center mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5"
                            onClick={() => handlePayEmiNow(selectedLoan.id)}
                          >
                            Pay EMI Now
                          </Button>
                        ))}
                    </div>

                    {/* Outstanding Doughnut Card */}
                    <div className="bg-slate-50 p-5 border border-slate-200/80 rounded-2xl space-y-4 text-xs">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Outstanding Breakdown
                      </h4>

                      <div className="relative flex items-center justify-center mx-auto w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-indigo-600"
                            strokeDasharray="90, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-500"
                            strokeDasharray="10, 100"
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-bold text-slate-900 block">
                            {formatCurrency(selectedLoan.outstandingPrincipal, false)}
                          </span>
                          <span className="text-[9px] text-slate-500">Balance</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-600" /> Principal Component
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(selectedLoan.outstandingPrincipal * 0.9, false)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Interest Component
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(selectedLoan.outstandingPrincipal * 0.1, false)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMI SCHEDULE */}
              {detailTab === 'EMI Schedule' && (
                <div className="space-y-4 text-xs">
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-slate-500 font-bold uppercase text-[10px]">
                            Installment
                          </th>
                          <th className="px-4 py-3 text-left text-slate-500 font-bold uppercase text-[10px]">
                            Due Date
                          </th>
                          <th className="px-4 py-3 text-right text-slate-500 font-bold uppercase text-[10px]">
                            EMI Amount
                          </th>
                          <th className="px-4 py-3 text-center text-slate-500 font-bold uppercase text-[10px]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        <tr>
                          <td className="px-4 py-3 font-bold">1</td>
                          <td className="px-4 py-3">{selectedLoan.dueDateLabel}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            {formatCurrency(selectedLoan.emiAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                selectedLoan.paidThisMonth
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {selectedLoan.paidThisMonth ? 'Paid' : 'Upcoming'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSACTIONS */}
              {detailTab === 'Transactions' && (
                <div className="space-y-3 text-xs">
                  {loanTxns.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-[10px] text-slate-500">Ref: {t.id} • {t.date}</p>
                      </div>
                      <span className="font-bold font-mono text-emerald-600">
                        {t.type === 'DEBIT' ? '-' : '+'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
