import { useState, useEffect } from 'react';
import { Coins, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN DISBURSEMENTS PAGE COMPONENT
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
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Disbursement Hub</h1>
        <p className="text-sm text-slate-400 mt-1">Initiate and authorize final funds transfer actions to borrower accounts.</p>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Inline success confirmation */}
      {recentlyDisbursed && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">
            Fund release sequence initiated successfully! Created active loan account: <code className="font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300">{recentlyDisbursed}</code>. Borrower dashboard and active loans portfolio are now updated in real-time.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
            <div className="h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Fetching pending disbursement queue from backend...</p>
          </div>
        ) : disbursementList.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No pending disbursements</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              All sanctioned applications have been disbursed. When a loan manager sanctions new proposals, they will appear here for fund release.
            </p>
          </div>
        ) : (
          disbursementList.map(item => (
            <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500">REF: {item.id}</span>
                <h4 className="text-md font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-500">Status: <code className="text-cyan-400 font-semibold">{item.status}</code></p>
              </div>
              <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-md font-bold text-white block">{formatCurrency(item.amount, false)}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
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
