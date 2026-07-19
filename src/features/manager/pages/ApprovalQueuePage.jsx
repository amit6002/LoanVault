import { useState, useEffect } from 'react';
import { Landmark, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, BadgeAlert, Coins, Sparkles, UserCheck } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { MOCK_APPLICATIONS } from '../../../data/mockLoans';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER APPROVAL QUEUE PAGE
 * Connected to Spring Boot REST API.
 * Receives proposals recommended by Loan Officers, displays officer audit remarks & CIBIL score,
 * and issues final sanction approvals and disbursements.
 * ============================================================
 */
export default function ApprovalQueuePage() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const fetchApprovalQueue = async () => {
    setIsLoadingQueue(true);
    try {
      // 1. Call Spring Boot API
      const data = await api.get('/api/applications/approval-queue');
      
      const localApps = JSON.parse(localStorage.getItem('lms_applications') || '[]');
      const combined = [...data, ...localApps, ...MOCK_APPLICATIONS];

      const uniqueMap = new Map();
      combined.forEach(item => {
        const id = item.referenceId || item.id;
        if (!uniqueMap.has(id)) {
          uniqueMap.set(id, {
            id: id,
            dbId: item.id,
            type: item.loanType || item.type || 'PERSONAL',
            amount: item.loanAmount || item.amount || 500000,
            tenureMonths: item.tenureMonths || 36,
            appliedDate: item.appliedAt ? new Date(item.appliedAt).toLocaleDateString('en-IN') : (item.appliedDate || '19 Jul 2026'),
            status: item.status || 'RECOMMENDED_APPROVE',
            fullName: item.fullName || 'Borrower Account',
            panNumber: item.panNumber || 'ABCDE1234F',
            officerRemarks: item.officerRemarks || item.remarks || 'Verified by Loan Officer. All 3 KYC documents match.',
            cibilScore: item.cibilScore || 785,
          });
        }
      });

      const queueList = Array.from(uniqueMap.values()).filter(
        app => app.status === 'RECOMMENDED_APPROVE' || app.status === 'RECOMMENDED_REJECT'
      );

      setApplications(queueList.length > 0 ? queueList : Array.from(uniqueMap.values()).slice(0, 3));
    } catch (err) {
      console.warn('Backend offline, using local approval queue data');
      const localApps = JSON.parse(localStorage.getItem('lms_applications') || '[]');
      const fallback = [...localApps, ...MOCK_APPLICATIONS].filter(
        app => app.status === 'RECOMMENDED_APPROVE' || app.status === 'RECOMMENDED_REJECT'
      );
      setApplications(fallback.length > 0 ? fallback : MOCK_APPLICATIONS);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleDecision = async (decisionType) => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const newStatus = decisionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const remarks = managerNotes || (decisionType === 'APPROVE'
        ? 'Sanctioned by Loan Manager. Funds authorized for immediate disbursement.'
        : 'Rejected by Manager after risk review.');

      // Try calling backend API
      if (selectedApp.dbId && typeof selectedApp.dbId === 'number') {
        const endpoint = decisionType === 'APPROVE' 
          ? `/api/applications/${selectedApp.dbId}/approve`
          : `/api/applications/${selectedApp.dbId}/reject`;
        await api.put(endpoint, { remarks });
      }

      // Update localStorage so Borrower dashboard reflects instantly
      const savedApps = JSON.parse(localStorage.getItem('lms_applications') || '[]');
      const existIdx = savedApps.findIndex(a => a.id === selectedApp.id);
      if (existIdx !== -1) {
        savedApps[existIdx].status = newStatus;
        savedApps[existIdx].remarks = remarks;
        localStorage.setItem('lms_applications', JSON.stringify(savedApps));
      } else {
        savedApps.unshift({
          id: selectedApp.id,
          type: selectedApp.type,
          amount: selectedApp.amount,
          tenureMonths: selectedApp.tenureMonths,
          status: newStatus,
          appliedDate: selectedApp.appliedDate,
          remarks: remarks,
        });
        localStorage.setItem('lms_applications', JSON.stringify(savedApps));
      }

      setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
      setSelectedApp(null);
    } catch (err) {
      alert(err.message || 'Failed to update sanction status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Heading */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Approval Queue</h1>
        <p className="text-sm text-slate-400 mt-1">Audit final officer recommendations, review credit profiles, and issue sanction disbursements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT CONTAINER: Queue list (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoadingQueue ? (
            <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching officer proposals from Spring Boot backend...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-10 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Queue cleared!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No recommended proposals are pending final sanction decision at this moment.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-800 text-slate-400' };
              const isSelected = selectedApp?.id === app.id;
              
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    isSelected 
                      ? 'bg-slate-900/80 border-purple-600 shadow-md ring-1 ring-purple-500/50' 
                      : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-500">REF: {app.id}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="text-md font-bold text-white">
                      {app.fullName} ({app.type} Loan)
                    </h3>
                    <p className="text-xs text-slate-500">Officer Proposal: Recommended Approval</p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-md font-black text-white">{formatCurrency(app.amount, false)}</p>
                    <span className="text-xs text-purple-400 font-semibold flex items-center justify-end gap-1">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Manager Sanction Desk</h3>
                  <span className="text-xs font-mono text-slate-500">REF: {selectedApp.id}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              </div>

              {/* Proposal summary */}
              <div className="space-y-3 text-xs leading-relaxed border-b border-slate-850 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Applicant Name</span>
                  <span className="text-white font-bold">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Sanction Amount Requested</span>
                  <span className="text-white font-bold">{formatCurrency(selectedApp.amount, false)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">CIBIL Bureau Score</span>
                  <span className="text-emerald-400 font-bold">{selectedApp.cibilScore || 785} (Excellent)</span>
                </div>
              </div>

              {/* Officer Audit Remarks */}
              <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> Underwriter Officer Report:
                </span>
                <p className="text-xs text-slate-300 italic leading-relaxed">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Decision Actions */}
              <div className="pt-2 flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                  leftIcon={Coins}
                  onClick={() => handleDecision('APPROVE')}
                  isLoading={actionLoading}
                >
                  Sanction & Release Funds
                </Button>

                <Button
                  variant="secondary"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                  onClick={() => handleDecision('REJECT')}
                  isLoading={actionLoading}
                >
                  Reject
                </Button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-400">No Proposal Selected</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click on any proposal card on the left list to review the underwriter report and issue final sanction approvals.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
