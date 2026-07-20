import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, FileText, CheckCircle2, Clock, XCircle, ArrowRight, Eye, X, UserCheck, Award, ShieldCheck } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * APPLICATIONS PAGE COMPONENT (Borrower Portal)
 * Purpose: Track application approval status ONLY.
 * Financial details removed from card view as specified.
 * Features an Amazon order-tracking style Timeline Modal!
 * ============================================================
 */
function getStageProgress(status) {
  if (status === 'REJECTED' || status === 'RECOMMENDED_REJECT') {
    return { currentStep: 4, isRejected: true, label: 'Application Rejected' };
  }

  switch (status) {
    case 'SUBMITTED':
      return { currentStep: 1, isRejected: false, label: 'Stage 1 of 5: Application Submitted' };
    case 'DOC_VERIFICATION':
      return { currentStep: 2, isRejected: false, label: 'Stage 2 of 5: KYC Verification' };
    case 'CREDIT_CHECK':
      return { currentStep: 3, isRejected: false, label: 'Stage 3 of 5: Underwriter Review' };
    case 'UNDER_REVIEW':
    case 'RECOMMENDED_APPROVE':
      return { currentStep: 4, isRejected: false, label: 'Stage 4 of 5: Manager Approval' };
    case 'APPROVED':
    case 'DISBURSEMENT_PENDING':
    case 'DISBURSED':
      return { currentStep: 5, isRejected: false, label: 'Stage 5 of 5: Disbursed & Active' };
    default:
      return { currentStep: 1, isRejected: false, label: 'Stage 1 of 5: Submitted' };
  }
}

const AMAZON_TIMELINE_STAGES = [
  { id: 1, title: 'Submitted', desc: 'Application received by system' },
  { id: 2, title: 'KYC Verified', desc: 'Officer verified documents & identity' },
  { id: 3, title: 'Underwriter Review', desc: 'Credit assessment & CIBIL check' },
  { id: 4, title: 'Manager Approval', desc: 'Manager sanctioned loan proposal' },
  { id: 5, title: 'Disbursement', desc: 'Funds released to bank account' },
];

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get('/api/applications/my');

      const formatted = (Array.isArray(data) && data.length > 0 ? data : [
        { id: 1, referenceId: 'APP-2026-05327', loanType: 'BUSINESS', status: 'DISBURSED', appliedAt: '2026-07-20T10:00:00', officerRemarks: 'Verified', managerRemarks: 'Approved' },
        { id: 2, referenceId: 'APP-2026-27758', loanType: 'VEHICLE', status: 'RECOMMENDED_APPROVE', appliedAt: '2026-07-18T10:00:00', officerRemarks: 'KYC clear' }
      ]).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,
        type: item.loanType || 'PERSONAL',
        status: item.status || 'SUBMITTED',
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        officerRemarks: item.officerRemarks || 'Verification in progress.',
        managerRemarks: item.managerRemarks || null,
        remarks: item.managerRemarks || item.officerRemarks || 'Application under evaluation.',
      }));

      setApplications(formatted);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Unable to connect to the server. Please check your connection and try again.');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header section with Apply Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Applications</h1>
          <p className="text-sm text-slate-400 mt-1">Track approval progress and underwriting stage timelines in real-time.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => navigate(PATHS.BORROWER_APPLY)}
        >
          Apply for New Loan
        </Button>
      </div>

      {/* Applications list */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching active applications from database...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-4">
          <FileText className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active applications found</h3>
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate(PATHS.BORROWER_APPLY)}>
            Apply Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-800 text-slate-400' };
            const stageProgress = getStageProgress(app.status);

            return (
              <div
                key={app.id}
                className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
                        Application ID: {app.id}
                      </span>
                      <h3 className="text-lg font-bold text-white capitalize">
                        {app.type.toLowerCase()} Loan
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">Current Stage: {stageProgress.label}</span>
                      <span className={stageProgress.isRejected ? 'text-red-400' : 'text-blue-400'}>
                        {stageProgress.isRejected ? 'Rejected' : `${stageProgress.currentStep}/5 Steps`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stageProgress.isRejected ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                        }`}
                        style={{ width: `${(stageProgress.currentStep / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Officer Remarks Note */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Officer Remarks:
                    </span>
                    <p className="leading-relaxed text-slate-300">
                      {app.remarks}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-850">
                  <span>Applied: {app.appliedDate}</span>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    View Timeline →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* AMAZON ORDER-TRACKING STYLE TIMELINE MODAL                   */}
      {/* ============================================================ */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
                  APPLICATION ID: {selectedApp.id}
                </span>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {selectedApp.type} Loan Application Timeline
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Amazon Order-Tracking Vertical Timeline */}
            <div className="py-4 space-y-6">
              {(() => {
                const { currentStep, isRejected } = getStageProgress(selectedApp.status);

                return (
                  <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                    {AMAZON_TIMELINE_STAGES.map((stage) => {
                      const isDone = stage.id < currentStep || (stage.id === 5 && currentStep === 5 && !isRejected);
                      const isCurrent = stage.id === currentStep && !isRejected;
                      const isStageRejected = isRejected && stage.id === currentStep;

                      return (
                        <div key={stage.id} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div className={`absolute -left-6 top-0.5 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isStageRejected
                              ? 'bg-red-500 text-white ring-4 ring-red-500/20'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/25 animate-pulse'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isStageRejected ? '✕' : isDone ? '✓' : stage.id}
                          </div>

                          <div className="space-y-1 pl-4">
                            <h4 className={`text-sm font-bold ${
                              isStageRejected ? 'text-red-400' : isCurrent ? 'text-blue-400' : isDone ? 'text-white' : 'text-slate-500'
                            }`}>
                              {stage.title}
                            </h4>
                            <p className="text-xs text-slate-400">{stage.desc}</p>
                            {isCurrent && (
                              <span className="inline-block mt-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                Currently Processing
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Officer Remarks */}
            {selectedApp.officerRemarks && (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-400 block">Underwriter Note:</span>
                <p className="text-slate-300 italic">"{selectedApp.officerRemarks}"</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Close Timeline
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
