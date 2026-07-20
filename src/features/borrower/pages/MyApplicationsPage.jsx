import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, FileText, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, Eye, X, UserCheck, AlertTriangle, Coins, Award } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * REAL-TIME LOAN APPLICATION STAGES MAPPER
 * Calculates active step index (1-5) and stage progress status
 * based on current application status in database.
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
      return { currentStep: 2, isRejected: false, label: 'Stage 2 of 5: Document Verification' };
    case 'CREDIT_CHECK':
      return { currentStep: 3, isRejected: false, label: 'Stage 3 of 5: Credit Score Assessment' };
    case 'UNDER_REVIEW':
    case 'RECOMMENDED_APPROVE':
      return { currentStep: 4, isRejected: false, label: 'Stage 4 of 5: Manager Sanction Review' };
    case 'APPROVED':
    case 'DISBURSEMENT_PENDING':
    case 'DISBURSED':
      return { currentStep: 5, isRejected: false, label: 'Stage 5 of 5: Loan Approved & Disbursed' };
    default:
      return { currentStep: 1, isRejected: false, label: 'Stage 1 of 5: Under Evaluation' };
  }
}

const STAGES_LIST = [
  { id: 1, title: 'Submitted', desc: 'Application Received' },
  { id: 2, title: 'Doc Verification', desc: 'Officer File Audit' },
  { id: 3, title: 'Credit Assessment', desc: 'CIBIL Bureau Pull' },
  { id: 4, title: 'Manager Review', desc: 'Sanction Approval' },
  { id: 5, title: 'Disbursement', desc: 'Funds Released' },
];

/**
 * ============================================================
 * MY APPLICATIONS PAGE COMPONENT (Borrower Portal)
 * Displays active application cards and an interactive "View Details"
 * modal with a live multi-step visual stage tracker.
 * ============================================================
 */
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

      const formatted = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,
        type: item.loanType || 'PERSONAL',
        amount: item.loanAmount || 0,
        tenureMonths: item.tenureMonths || 0,
        interestRate: item.interestRate || 10.5,
        status: item.status || 'SUBMITTED',
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        sanctionedDate: item.sanctionedAt
          ? new Date(item.sanctionedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : null,
        fullName: item.fullName || 'Borrower Account',
        panNumber: item.panNumber || 'N/A',
        employmentType: item.employmentType || 'SALARIED',
        employerName: item.employerName || 'N/A',
        monthlyIncome: item.monthlyIncome || 0,
        officerRemarks: item.officerRemarks || null,
        managerRemarks: item.managerRemarks || null,
        cibilScore: item.cibilScore || null,
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Loan Applications</h1>
          <p className="text-sm text-slate-400 mt-1">Track underwriting status and sanction approvals in real-time.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => navigate(PATHS.BORROWER_APPLY)}
        >
          Apply for New Loan
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-3">
          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
            <button
              onClick={fetchMyApplications}
              className="text-xs text-red-300 underline mt-2 hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Applications list */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching your active loan applications from database...</p>
        </div>
      ) : applications.length === 0 && !error ? (
        <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-4">
          <FileText className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active applications found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You haven't submitted any loan requests yet. Click below to start a new application.
          </p>
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
                className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4 hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
                        REF: {app.id}
                      </span>
                      <h3 className="text-lg font-bold text-white capitalize">
                        {app.type.toLowerCase()} Loan
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block">Requested Amount</span>
                      <span className="text-base font-extrabold text-white">
                        {formatCurrency(app.amount, false)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tenure</span>
                      <span className="text-base font-bold text-slate-200">
                        {app.tenureMonths} Months
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress Mini-bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">{stageProgress.label}</span>
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

                  {/* System Remark Note */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Underwriter Note:
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
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors group-hover:translate-x-0.5"
                  >
                    <Eye className="h-4 w-4" /> View Details & Stages
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* APPLICATION DETAILS & STAGE TRACKER MODAL                    */}
      {/* ============================================================ */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 my-8 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 block mb-1">
                  REFERENCE ID: {selectedApp.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-blue-500" />
                  {selectedApp.type} Loan Application
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. VISUAL MULTI-STEP STAGE PROGRESS TRACKER */}
            <div className="space-y-4 bg-slate-950/60 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" /> Real-Time Stage Tracker
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  STATUS_CONFIG[selectedApp.status]?.color || 'bg-slate-800 text-slate-400'
                }`}>
                  {STATUS_CONFIG[selectedApp.status]?.label || selectedApp.status}
                </span>
              </div>

              {/* Stepper Timeline */}
              {(() => {
                const { currentStep, isRejected } = getStageProgress(selectedApp.status);

                return (
                  <div className="py-4">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {STAGES_LIST.map((stage) => {
                        const isDone = stage.id < currentStep || (stage.id === 5 && currentStep === 5 && !isRejected);
                        const isCurrent = stage.id === currentStep && !isRejected;
                        const isStageRejected = isRejected && stage.id === currentStep;

                        return (
                          <div key={stage.id} className="flex flex-col items-center text-center space-y-2 relative z-10">
                            {/* Icon Circle */}
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isStageRejected
                                ? 'bg-red-500 text-white ring-4 ring-red-500/20'
                                : isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-500/25 animate-pulse'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              {isStageRejected ? '✕' : isDone ? '✓' : stage.id}
                            </div>
                            <div className="space-y-0.5">
                              <p className={`text-xs font-bold leading-tight ${
                                isStageRejected ? 'text-red-400' : isCurrent ? 'text-blue-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                              }`}>
                                {stage.title}
                              </p>
                              <p className="text-[10px] text-slate-500 hidden sm:block">
                                {stage.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. FINANCIAL & APPLICANT BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Financial Parameters */}
              <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                  Loan Terms
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sanctioned / Requested</span>
                  <span className="text-white font-extrabold">{formatCurrency(selectedApp.amount, false)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Repayment Tenure</span>
                  <span className="text-slate-200 font-bold">{selectedApp.tenureMonths} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interest Rate</span>
                  <span className="text-emerald-400 font-bold">{selectedApp.interestRate}% P.A. (Fixed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Applied</span>
                  <span className="text-slate-300 font-medium">{selectedApp.appliedDate}</span>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                  Applicant Profile
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name</span>
                  <span className="text-white font-bold">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PAN Card</span>
                  <span className="text-slate-300 font-mono">{selectedApp.panNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employment Type</span>
                  <span className="text-slate-200 font-semibold">{selectedApp.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer / Business</span>
                  <span className="text-slate-300">{selectedApp.employerName}</span>
                </div>
              </div>

            </div>

            {/* 3. UNDERWRITER REMARKS & AUDIT LOGS */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">
                Underwriting Verification Log
              </h4>
              
              {selectedApp.officerRemarks && (
                <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" /> Officer Audit Report:
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">"{selectedApp.officerRemarks}"</p>
                </div>
              )}

              {selectedApp.managerRemarks && (
                <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" /> Manager Sanction Decision:
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">"{selectedApp.managerRemarks}"</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Last updated: {selectedApp.sanctionedDate || selectedApp.appliedDate}
              </span>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="secondary" onClick={() => setSelectedApp(null)} className="w-full sm:w-auto">
                  Close Details
                </Button>
                
                {(selectedApp.status === 'DISBURSED' || selectedApp.status === 'APPROVED' || selectedApp.status === 'DISBURSEMENT_PENDING') && (
                  <Button
                    variant="primary"
                    rightIcon={ArrowRight}
                    onClick={() => { setSelectedApp(null); navigate(PATHS.BORROWER_LOANS); }}
                    className="w-full sm:w-auto"
                  >
                    View Active Loan Account
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
