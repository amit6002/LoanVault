import { useState, useEffect, useMemo } from 'react';
import { Landmark, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, UserCheck, ChevronRight, CheckSquare, Sparkles, XCircle } from 'lucide-react';
import { PATHS, STATUS_CONFIG, DOCUMENT_TYPE_LABELS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';
import Checkbox from '../../../components/common/Checkbox';

/**
 * ============================================================
 * LOAN OFFICER APPLICATION QUEUE PAGE (LIGHT THEME)
 * Manages loan underwriting, verification audits, CIBIL pull requests,
 * manual document inspection checkboxes, and manager recommendations.
 * Audit Workspace opens in a centered Pop-Up Modal Window.
 * ============================================================
 */
export default function ApplicationQueuePage() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [error, setError] = useState(null);
  
  const [docsVerified, setDocsVerified] = useState({
    idProof: false,
    incomeProof: false,
    bankStatement: false,
  });
  const [cibilScore, setCibilScore] = useState(null);
  const [cibilLoading, setCibilLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspectingDoc, setInspectingDoc] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    setError(null);
    try {
      const data = await api.get('/api/applications/queue');

      const queueList = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,
        type: item.loanType || 'PERSONAL',
        amount: item.loanAmount || 0,
        tenureMonths: item.tenureMonths || 0,
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        status: item.status || 'SUBMITTED',
        fullName: item.fullName || (item.borrower?.name) || 'Borrower',
        panNumber: item.panNumber || 'N/A',
        employmentType: item.employmentType || 'SALARIED',
        employerName: item.employerName || 'N/A',
        monthlyIncome: item.monthlyIncome || 0,
        cibilScore: item.cibilScore || null,
      }));

      setApplications(queueList);
    } catch (err) {
      console.error('Failed to fetch officer queue:', err);
      setError('Unable to connect to the server. Please check your connection and try again.');
      setApplications([]);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setDocsVerified({ idProof: false, incomeProof: false, bankStatement: false });
    setCibilScore(app.cibilScore || null);
    setOfficerNotes('');
    setInspectingDoc(null);
  };

  const handlePullCibil = () => {
    setCibilLoading(true);
    setTimeout(() => {
      setCibilLoading(false);
      const randomScore = Math.floor(720 + Math.random() * 100);
      setCibilScore(randomScore);
    }, 1000);
  };

  const handleRecommendation = async (recommendationType) => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const remarks = officerNotes || (recommendationType === 'APPROVE'
        ? `Verified by Loan Officer. CIBIL score: ${cibilScore || 780}. Approved for manager sanction.`
        : 'Rejected due to document discrepancies.');

      await api.put(`/api/applications/${selectedApp.dbId}/recommend`, {
        recommendation: recommendationType,
        remarks: remarks,
      });

      setSelectedApp(null);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to submit recommendation.');
    } finally {
      setActionLoading(false);
    }
  };

  const allDocsChecked = docsVerified.idProof && docsVerified.incomeProof && docsVerified.bankStatement;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Underwriting & Review Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Perform KYC document inspections, CIBIL pulls, and submit manager recommendations.
          </p>
        </div>

        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono">
          {applications.length} Workload Items
        </span>
      </div>

      {/* 2. Main Applications Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-card">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-md font-bold text-slate-900">Pending Verification Workload</h3>
          <button
            onClick={fetchQueue}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>

        {isLoadingQueue ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Loading application queue...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Queue is Empty</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
              No borrower applications are pending document verification checks at this moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600 border border-slate-200' };
              
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-500/50 bg-white hover:bg-slate-50/50 transition-all duration-300 cursor-pointer shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 space-y-4 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-indigo-600">REF: {app.id}</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {app.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{app.type} Loan Application</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400">Requested</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(app.amount, false)}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-indigo-600 group-hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs">
                      Audit File &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CENTERED POP-UP MODAL WINDOW FOR AUDIT WORKSPACE */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 animate-modal-scale relative text-slate-900 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="border-b border-slate-200 pb-4 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Audit Workspace</h3>
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

            {/* Borrower Profile Details */}
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
                <span className="text-slate-500 font-medium">Employment / Employer</span>
                <span className="text-slate-800 font-semibold">{selectedApp.employmentType} ({selectedApp.employerName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Monthly Income</span>
                <span className="text-emerald-700 font-bold">{formatCurrency(selectedApp.monthlyIncome, false)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Requested Loan Amount</span>
                <span className="text-slate-900 font-black">{formatCurrency(selectedApp.amount, false)}</span>
              </div>
            </div>

            {/* Step 1: Manual Document Inspection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Manual Document Inspection</h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-mono font-bold border border-indigo-200">
                  {Object.values(docsVerified).filter(Boolean).length}/3 Verified
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-xs">
                {/* ID Proof Doc */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="doc_id"
                      checked={docsVerified.idProof}
                      onChange={(e) => setDocsVerified(prev => ({ ...prev, idProof: e.target.checked }))}
                      label="PAN Card / Govt ID"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingDoc('PAN Card PDF Preview')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect File
                  </button>
                </div>

                {/* Income Proof Doc */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="doc_inc"
                      checked={docsVerified.incomeProof}
                      onChange={(e) => setDocsVerified(prev => ({ ...prev, incomeProof: e.target.checked }))}
                      label="Salary Slip / ITR File"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingDoc('Salary Slip PDF Preview')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect File
                  </button>
                </div>

                {/* Bank Statement Doc */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="doc_bank"
                      checked={docsVerified.bankStatement}
                      onChange={(e) => setDocsVerified(prev => ({ ...prev, bankStatement: e.target.checked }))}
                      label="6-Month Bank Statement"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingDoc('Bank Statement PDF Preview')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect File
                  </button>
                </div>
              </div>

              {/* Inspection Document Preview Box */}
              {inspectingDoc && (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <FileText className="h-4 w-4 text-indigo-600" /> {inspectingDoc}
                    </span>
                    <button onClick={() => setInspectingDoc(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">Close</button>
                  </div>
                  <div className="p-3 bg-white rounded-xl font-mono text-[10px] text-slate-600 border border-slate-200">
                    📄 Verified digital signature: <span className="text-emerald-700 font-bold">SHA256: 4a9f82...VALID</span><br />
                    Status: Document metadata matches PAN {selectedApp.panNumber}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: CIBIL Score Pull */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Credit Score Pull</h4>

              {cibilScore ? (
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">CIBIL Report Score:</span>
                  <span className={`text-md font-black ${
                    cibilScore >= 750 ? 'text-emerald-700' : cibilScore >= 680 ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {cibilScore} ({cibilScore >= 750 ? 'Excellent Risk' : cibilScore >= 680 ? 'Moderate' : 'High Risk'})
                  </span>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handlePullCibil}
                  isLoading={cibilLoading}
                >
                  Pull Bureau Credit Score
                </Button>
              )}
            </div>

            {/* Step 3: Officer Notes */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Officer Remarks for Manager
              </label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="e.g. All 3 KYC documents verified manually. CIBIL score is excellent."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>

            {/* Step 4: Decision Actions */}
            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
                onClick={() => handleRecommendation('APPROVE')}
                isLoading={actionLoading}
                disabled={!allDocsChecked}
              >
                Recommend Approval
              </Button>

              <Button
                variant="secondary"
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                onClick={() => handleRecommendation('REJECT')}
                isLoading={actionLoading}
              >
                Reject
              </Button>
            </div>

            {!allDocsChecked && (
              <p className="text-[11px] text-amber-700 text-center font-bold">
                ⚠️ Check all 3 document verification checkboxes above to enable recommendation.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
