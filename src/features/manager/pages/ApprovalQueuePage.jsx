import { useState, useEffect } from 'react';
import { Landmark, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, BadgeAlert, Coins, Sparkles, UserCheck, XCircle } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER APPROVAL QUEUE PAGE (LIGHT THEME)
 * Connected to Spring Boot REST API.
 * Receives proposals recommended by Loan Officers, displays officer audit remarks & CIBIL score,
 * and issues final sanction approvals and disbursements.
 * ============================================================
 */
export default function ApprovalQueuePage() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const fetchApprovalQueue = async () => {
    setIsLoadingQueue(true);
    setError(null);
    try {
      const data = await api.get('/api/applications/approval-queue');

      const queueList = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,
        type: item.loanType || 'PERSONAL',
        amount: item.loanAmount || 0,
        tenureMonths: item.tenureMonths || 0,
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        status: item.status || 'RECOMMENDED_APPROVE',
        fullName: item.fullName || (item.borrower?.name) || 'Borrower',
        panNumber: item.panNumber || 'N/A',
        officerRemarks: item.officerRemarks || 'Verified by Loan Officer.',
        cibilScore: item.cibilScore || null,
      }));

      setApplications(queueList);
    } catch (err) {
      console.error('Failed to fetch approval queue:', err);
      setError('Unable to connect to the server. Please check your connection and try again.');
      setApplications([]);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleDecision = async (decisionType) => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const remarks = managerNotes || (decisionType === 'APPROVE'
        ? 'Sanctioned by Loan Manager. Funds authorized for immediate disbursement.'
        : 'Rejected by Manager after risk review.');

      const endpoint = decisionType === 'APPROVE' 
        ? `/api/applications/${selectedApp.dbId}/approve`
        : `/api/applications/${selectedApp.dbId}/reject`;
      await api.put(endpoint, { remarks });

      setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
      setSelectedApp(null);
      setManagerNotes('');
    } catch (err) {
      alert(err.message || 'Failed to update sanction status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Heading */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Approval Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Audit final officer recommendations, review credit profiles, and issue sanction disbursements.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
            <button
              onClick={fetchApprovalQueue}
              className="text-xs text-rose-700 font-bold underline mt-2 hover:text-rose-800 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CONTAINER: Queue list (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoadingQueue ? (
            <div className="p-8 text-center text-slate-500 font-medium space-y-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching officer proposals from Spring Boot backend...</p>
            </div>
          ) : applications.length === 0 && !error ? (
            <div className="bg-white border border-slate-200/80 p-10 rounded-2xl text-center space-y-4 shadow-xs">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900">Queue cleared!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                No recommended proposals are pending final sanction decision at this moment.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600 border border-slate-200' };
              const isSelected = selectedApp?.id === app.id;
              
              return (
                <div
                  key={app.id}
                  onClick={() => { setSelectedApp(app); setManagerNotes(''); }}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-500 text-slate-900 shadow-xs' 
                      : 'bg-white border-slate-200/80 hover:border-indigo-500/50 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">REF: {app.id}</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="text-md font-bold text-slate-900">
                      {app.fullName} ({app.type} Loan)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Officer Proposal: Recommended Approval</p>
                  </div>

                  <div className="text-right space-y-1.5">
                    <p className="text-md font-black text-slate-900">{formatCurrency(app.amount, false)}</p>
                    <span className="text-xs text-indigo-600 font-bold flex items-center justify-end gap-1">
                      Audit Proposal →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT CONTAINER: Manager Sanction Decision Box (5 columns) */}
        <div className="lg:col-span-5">
          {selectedApp ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300 shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Manager Sanction Desk</h3>
                  <span className="text-xs font-mono text-indigo-600 font-bold">REF: {selectedApp.id}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              </div>

              {/* Proposal summary */}
              <div className="space-y-2 text-xs leading-relaxed border-b border-slate-200 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Applicant Name</span>
                  <span className="text-slate-900 font-bold">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sanction Amount Requested</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(selectedApp.amount, false)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">CIBIL Bureau Score</span>
                  <span className="text-emerald-700 font-bold">{selectedApp.cibilScore || 'Not Pulled'}</span>
                </div>
              </div>

              {/* Officer Audit Remarks */}
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600" /> Underwriter Officer Report:
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{selectedApp.officerRemarks}"
                </p>
              </div>

              {/* Manager Sanction Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Manager Sanction Remarks
                </label>
                <textarea
                  rows={2}
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Sanction approved at 8.4% interest rate. Authorized for fund release."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>

              {/* Decision Actions */}
              <div className="pt-2 flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
                  leftIcon={Coins}
                  onClick={() => handleDecision('APPROVE')}
                  isLoading={actionLoading}
                >
                  Sanction & Release Funds
                </Button>

                <Button
                  variant="secondary"
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                  onClick={() => handleDecision('REJECT')}
                  isLoading={actionLoading}
                >
                  Reject
                </Button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No Proposal Selected</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Click on any proposal card on the left list to review the underwriter report and issue final sanction approvals.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
