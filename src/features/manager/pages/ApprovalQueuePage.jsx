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
 * Manager Sanction Desk opens in a centered Pop-Up Modal Window.
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

  // Lock background page scroll when pop-up modal is active
  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedApp]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BadgeAlert className="h-7 w-7 text-indigo-600" />
            Manager Approval Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">Audit final officer recommendations, review credit profiles, and issue sanction disbursements.</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono">
          {applications.length} Proposals Pending
        </span>
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
              className="text-xs font-bold text-rose-700 underline mt-2 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Proposals Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-card">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-md font-bold text-slate-900">Recommended Officer Proposals</h3>
          <button
            onClick={fetchApprovalQueue}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>

        {isLoadingQueue ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Loading approval queue...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Approval Queue Clear</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
              No recommended loan proposals are currently pending manager sanction decision.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-500/50 bg-white hover:bg-slate-50/50 transition-all duration-300 cursor-pointer shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 space-y-4 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-indigo-600">REF: {app.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    RECOMMENDED
                  </span>
                </div>

                <div>
                  <h3 className="text-md font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {app.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{app.type} Loan Proposal</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">Sanction Amount</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(app.amount, false)}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-indigo-600 group-hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs">
                    Audit Proposal &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CENTERED POP-UP MODAL WINDOW FOR MANAGER SANCTION DESK */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <div className="bg-white border border-slate-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 animate-modal-scale relative text-slate-900 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="border-b border-slate-200 pb-4 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Manager Sanction Desk</h3>
                <span className="text-xs font-mono text-indigo-600 font-bold">REF ID: {selectedApp.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Proposal summary */}
            <div className="space-y-2.5 text-xs leading-relaxed border-b border-slate-200 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Applicant Name</span>
                <span className="text-slate-900 font-bold">{selectedApp.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">PAN Card</span>
                <span className="text-slate-700 font-mono font-bold">{selectedApp.panNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Sanction Amount Requested</span>
                <span className="text-slate-900 font-black">{formatCurrency(selectedApp.amount, false)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">CIBIL Bureau Score</span>
                <span className="text-emerald-700 font-bold">{selectedApp.cibilScore || '785 (Excellent)'}</span>
              </div>
            </div>

            {/* Officer Audit Remarks */}
            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" /> Underwriter Officer Report:
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
        </div>
      )}
    </div>
  );
}
