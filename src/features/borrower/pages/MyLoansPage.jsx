import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, Download, CreditCard, ChevronRight, CheckCircle2, FileText, Search, Plus, Calendar, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT
 * 1-to-1 visual fidelity matching Image 2 mockup.
 * Master-Detail Architecture:
 *   Left: All Loans cards (Business Loan, Vehicle Loan, Home Loan)
 *   Right: Workspace Details (Overview, EMI Schedule, Transactions, Documents)
 * ============================================================
 */
export default function MyLoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('LN-APP-2026-05327');
  const [detailTab, setDetailTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/loans/my');
      const list = (Array.isArray(data) && data.length > 0 ? data : [
        { id: 'LN-APP-2026-05327', loanType: 'Business', status: 'ACTIVE', sanctionedAmount: 800000, outstandingPrincipal: 200000, interestRate: 12.0, tenureMonths: 24, emisPaid: 12, emiAmount: 9414.69, nextEmiDate: '2026-08-05' },
        { id: 'LN-APP-2026-27758', loanType: 'Vehicle', status: 'ACTIVE', sanctionedAmount: 1040800, outstandingPrincipal: 1040800, interestRate: 9.25, tenureMonths: 60, emisPaid: 12, emiAmount: 9249.71, nextEmiDate: '2026-08-10' },
        { id: 'LN-APP-2026-00812', loanType: 'Home', status: 'SUBMITTED', sanctionedAmount: 5500000, outstandingPrincipal: 0, interestRate: 8.4, tenureMonths: 240, emisPaid: 0, emiAmount: 0, nextEmiDate: '-' }
      ]).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        name: `${l.loanType || 'Business'} Loan`,
        status: l.status || 'ACTIVE',
        sanctioned: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        interestRate: l.interestRate || 12.0,
        tenureMonths: l.tenureMonths || 24,
        paidMonths: l.emisPaid || 12,
        nextEmi: l.emiAmount || 9414.69,
        nextDueDate: l.nextEmiDate && l.nextEmiDate !== '-' ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        progress: l.sanctionedAmount > 0 ? Math.round(((l.sanctionedAmount - l.outstandingPrincipal) / l.sanctionedAmount) * 100) : 32,
      }));

      setLoans(list);
      if (list.length > 0) {
        setActiveTab(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch active loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLoans = loans.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLoan = loans.find(l => l.id === activeTab) || loans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Loans</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track all your loan accounts</p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => navigate(PATHS.BORROWER_APPLY)}
        >
          Apply for New Loan
        </Button>
      </div>

      {/* MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MASTER LIST (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search bar + filter dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none">
              <option value="ALL">All Loans</option>
              <option value="ACTIVE">Active Loans</option>
            </select>
          </div>

          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Loans ({filteredLoans.length})
          </h2>

          {/* Loan Cards List */}
          {filteredLoans.map(loan => {
            const isSelected = activeTab === loan.id;

            return (
              <div
                key={loan.id}
                onClick={() => setActiveTab(loan.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-900/90 border-blue-600 ring-1 ring-blue-500/50 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      loan.name.includes('Business') ? 'bg-blue-600/20 text-blue-400' : loan.name.includes('Vehicle') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{loan.name}</h3>
                      <span className="text-[11px] font-mono text-slate-500">Loan ID: {loan.id}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Outstanding</span>
                    <span className="text-white font-bold">{formatCurrency(loan.outstanding, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Next EMI</span>
                    <span className="text-white font-bold">{loan.nextEmi > 0 ? formatCurrency(loan.nextEmi) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Due Date</span>
                    <span className="text-slate-300">{loan.nextDueDate}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Progress</span>
                    <span>{loan.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      loan.name.includes('Business') ? 'bg-blue-500' : loan.name.includes('Vehicle') ? 'bg-emerald-500' : 'bg-purple-500'
                    }`} style={{ width: `${loan.progress}%` }} />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: WORKSPACE DETAILS (7 columns) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedLoan ? (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase">{selectedLoan.name}</span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {selectedLoan.name}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {selectedLoan.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Loan ID: {selectedLoan.id}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
                {['Overview', 'EMI Schedule', 'Transactions', 'Documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`pb-2 border-b-2 transition-all ${
                      detailTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {detailTab === 'Overview' && (
                <div className="space-y-6">
                  
                  {/* Top Row: Loan Summary + Outstanding Overview Doughnut */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Loan Summary Parameters */}
                    <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-2 text-xs">
                      <h4 className="font-bold text-white border-b border-slate-850 pb-2 mb-3">Loan Summary</h4>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Loan Amount</span>
                        <span className="text-white font-bold">₹8,00,000</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Outstanding Amount</span>
                        <span className="text-white font-bold">₹2,00,000</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Interest Rate</span>
                        <span className="text-emerald-400 font-bold">12% p.a.</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Tenure</span>
                        <span className="text-slate-300">24 Months</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">EMI Amount</span>
                        <span className="text-emerald-400 font-bold">₹9,414.69</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">EMIs Paid</span>
                        <span className="text-slate-300 font-bold">12 of 24</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Next EMI Due</span>
                        <span className="text-slate-300 font-bold">05 Aug 2026</span>
                      </div>

                      <Button
                        variant="primary"
                        className="w-full justify-center mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2"
                        onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
                      >
                        Pay EMI Now
                      </Button>
                    </div>

                    {/* Outstanding Overview Doughnut */}
                    <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-4 text-xs">
                      <h4 className="font-bold text-white border-b border-slate-850 pb-2">Outstanding Overview</h4>
                      
                      <div className="relative flex items-center justify-center mx-auto w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-800" strokeWidth="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-blue-500" strokeDasharray="90, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-emerald-500" strokeDasharray="10, 100" strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-bold text-white block">₹2,00,000</span>
                          <span className="text-[9px] text-slate-500">Outstanding</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Principal Outstanding</span>
                          <span className="font-bold text-white">₹1,80,000 (90%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Interest Outstanding</span>
                          <span className="font-bold text-white">₹20,000 (10%)</span>
                        </div>
                      </div>

                      <a href="#amortization" onClick={(e) => { e.preventDefault(); setDetailTab('EMI Schedule'); }} className="text-xs text-blue-400 hover:text-blue-300 font-semibold text-center block pt-1">
                        View Amortization Schedule →
                      </a>
                    </div>

                  </div>

                  {/* Bottom Row: Next EMI Box + Recent Transactions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Next EMI Card */}
                    <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-3 text-xs relative">
                      <span className="absolute top-4 right-4 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                        DUE SOON
                      </span>
                      <h4 className="font-bold text-white border-b border-slate-850 pb-2">Next EMI</h4>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-white">₹9,414.69</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-850 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Due Date</span>
                          <span className="text-white font-bold">05 Aug 2026</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">EMI Amount</span>
                          <span className="text-white font-bold">₹9,414.69</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Principal</span>
                          <span className="text-slate-300">₹8,534.10</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Interest</span>
                          <span className="text-slate-300">₹880.59</span>
                        </div>
                      </div>

                      <a href="#schedule" onClick={(e) => { e.preventDefault(); setDetailTab('EMI Schedule'); }} className="text-xs text-blue-400 hover:text-blue-300 font-semibold block pt-1">
                        View EMI Schedule →
                      </a>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <h4 className="font-bold text-white">Recent Transactions</h4>
                        <span onClick={() => setDetailTab('Transactions')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer text-[11px]">View All</span>
                      </div>

                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-white">EMI Payment</p>
                              <p className="text-[10px] text-slate-500">05 Jul 2026</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">-₹9,414.69</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded">
                              <Coins className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-white">Loan Disbursed</p>
                              <p className="text-[10px] text-slate-500">20 Jul 2026</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">+₹8,00,000</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-white">Processing Fee</p>
                              <p className="text-[10px] text-slate-500">18 Jul 2026</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-400">-₹2,500.00</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: EMI SCHEDULE */}
              {detailTab === 'EMI Schedule' && (
                <div className="space-y-4 text-xs">
                  <div className="overflow-x-auto border border-slate-850 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-850">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="px-3 py-2 text-left text-slate-400 font-bold">Installment</th>
                          <th className="px-3 py-2 text-left text-slate-400 font-bold">Due Date</th>
                          <th className="px-3 py-2 text-right text-slate-400 font-bold">EMI Amount</th>
                          <th className="px-3 py-2 text-center text-slate-400 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-950/40 text-slate-300">
                        <tr>
                          <td className="px-3 py-2 font-bold">1</td>
                          <td className="px-3 py-2">05 Jul 2026</td>
                          <td className="px-3 py-2 text-right">₹9,414.69</td>
                          <td className="px-3 py-2 text-center"><span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Paid</span></td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-bold">2</td>
                          <td className="px-3 py-2">05 Aug 2026</td>
                          <td className="px-3 py-2 text-right">₹9,414.69</td>
                          <td className="px-3 py-2 text-center"><span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">Upcoming</span></td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-bold">3</td>
                          <td className="px-3 py-2">05 Sep 2026</td>
                          <td className="px-3 py-2 text-right">₹9,414.69</td>
                          <td className="px-3 py-2 text-center"><span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">Upcoming</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSACTIONS */}
              {detailTab === 'Transactions' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">EMI Payment Received</p>
                      <p className="text-[10px] text-slate-500">Ref: TXN-8012 • 05 Jul 2026</p>
                    </div>
                    <span className="font-bold text-emerald-400">-₹9,414.69</span>
                  </div>
                </div>
              )}

              {/* TAB 4: DOCUMENTS */}
              {detailTab === 'Documents' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-2">
                      📄 Loan Agreement & Sanction Letter ({selectedLoan.id})
                    </span>
                    <Button variant="secondary" size="sm" leftIcon={Download} onClick={() => navigate(PATHS.BORROWER_DOCUMENTS)}>
                      Download
                    </Button>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
}
