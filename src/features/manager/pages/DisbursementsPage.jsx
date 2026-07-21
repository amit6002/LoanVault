import { useState, useEffect } from 'react';
import { Coins, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN DISBURSEMENTS PAGE COMPONENT (LIGHT THEME)
 * Renders list of sanctioned applications pending fund transfers.
 * Connected directly to Spring Boot backend API!
 * ============================================================
 */
export default function DisbursementsPage() {
  const [disbursementList, setDisbursementList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [recentlyDisbursed, setRecentlyDisbursed] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchPendingDisbursements();
  }, []);

  const fetchPendingDisbursements = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await api.get('/api/disbursements/pending');
      const formatted = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,
        name: `${item.fullName || 'Borrower'} (${item.loanType || 'Loan'})`,
        amount: item.loanAmount || 0,
        status: item.status || 'DISBURSEMENT_PENDING',
        bank: `Default Transfer Node`,
      }));

      setDisbursementList(formatted);
    } catch (err) {
      console.warn('Failed to fetch pending disbursements:', err);
      setApiError('Unable to fetch pending disbursements from server.');
      setDisbursementList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisburse = async (item) => {
    setLoadingId(item.id);
    setRecentlyDisbursed(null);
    setApiError(null);

    try {
      const res = await api.post(`/api/disbursements/${item.dbId}/release`, {});
      const loanAccNo = res.data?.loanAccountNumber || item.id;

      setDisbursementList(prev => prev.filter(d => d.id !== item.id));
      setRecentlyDisbursed(loanAccNo);
    } catch (err) {
      setApiError(err.message || 'Failed to release funds.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Disbursement Hub</h1>
        <p className="text-sm text-slate-500 mt-1">Initiate and authorize final funds transfer actions to borrower accounts.</p>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Inline success confirmation */}
      {recentlyDisbursed && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 font-medium">
            Fund release sequence initiated successfully! Created active loan account: <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 font-bold">{recentlyDisbursed}</code>. Borrower dashboard and active loans portfolio are now updated in real-time.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-medium space-y-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Fetching pending disbursement queue from backend...</p>
          </div>
        ) : disbursementList.length === 0 ? (
          <div className="bg-white border border-slate-200/80 p-12 rounded-2xl text-center space-y-3 shadow-xs">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">No pending disbursements</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
              All sanctioned applications have been disbursed. When a loan manager sanctions new proposals, they will appear here for fund release.
            </p>
          </div>
        ) : (
          disbursementList.map(item => (
            <div key={item.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:border-indigo-500/50 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-indigo-600">REF: {item.id}</span>
                <h4 className="text-md font-bold text-slate-900">{item.name}</h4>
                <p className="text-xs text-slate-500 font-medium">Status: <code className="text-indigo-600 font-bold">{item.status}</code></p>
              </div>
              <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-md font-black text-slate-900 block">{formatCurrency(item.amount, false)}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    SANCTIONED
                  </span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  leftIcon={Coins}
                  onClick={() => handleDisburse(item)} 
                  isLoading={loadingId === item.id}
                >
                  Release Funds
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
