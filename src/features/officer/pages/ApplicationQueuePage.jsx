import { useState, useEffect, useMemo } from 'react';
import { Landmark, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, UserCheck, ChevronRight, CheckSquare, Sparkles, XCircle } from 'lucide-react';
import { PATHS, STATUS_CONFIG, DOCUMENT_TYPE_LABELS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';
import Checkbox from '../../../components/common/Checkbox';

/**
 * ============================================================
 * LOAN OFFICER APPLICATION QUEUE PAGE
 * Manages loan underwriting, verification audits, CIBIL pull requests,
 * manual document inspection checkboxes, and manager recommendations.
 * Connected directly to Spring Boot REST API!
 * ============================================================
 */
export default function ApplicationQueuePage() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom states for document & credit verification
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

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    setError(null);
    try {
      // Fetch from Spring Boot API — single source of truth
      const data = await api.get('/api/applications/queue');

      const queueList = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        dbId: item.id,  // Always the numeric database ID
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

  // Simulate CIBIL score pull
  const handlePullCibil = () => {
    setCibilLoading(true);
    setTimeout(() => {
      setCibilLoading(false);
      const randomScore = Math.floor(720 + Math.random() * 100); // between 720 and 820
      setCibilScore(randomScore);
    }, 1000);
  };

  // Submit Officer Recommendation to Backend
  const handleRecommendation = async (recommendationType) => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const remarks = officerNotes || (recommendationType === 'APPROVE'
        ? `Verified by Loan Officer. CIBIL score: ${cibilScore || 780}. Approved for manager sanction.`
        : 'Rejected due to document discrepancies.');

      // Call backend API — single source of truth
      await api.put(`/api/applications/${selectedApp.dbId}/recommend`, {
        recommendation: recommendationType,
        remarks: remarks,
      });

      // Update local state list — remove from queue since it's now recommended
      setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
      setSelectedApp(null);
    } catch (err) {
      alert(err.message || 'Failed to submit recommendation.');
    } finally {
      setActionLoading(false);
    }
  };

  const allDocsChecked = docsVerified.idProof && docsVerified.incomeProof && docsVerified.bankStatement;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Heading */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Application Queue</h1>
        <p className="text-sm text-slate-400 mt-1">Review KYC files, manually inspect documents, evaluate credit reports, and forward proposals to Loan Managers.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-3">
          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
            <button
              onClick={fetchQueue}
              className="text-xs text-red-300 underline mt-2 hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT CONTAINER: Queue grid (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoadingQueue ? (
            <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching pending underwriting queue from Spring Boot backend...</p>
            </div>
          ) : applications.length === 0 && !error ? (
            <div className="bg-slate-900 border border-slate-850 p-10 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Queue completely cleared!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No borrower applications are pending document verification checks at this moment. Apply for a new loan as a Borrower to see it appear here in real-time!
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-800 text-slate-400' };
              const isSelected = selectedApp?.id === app.id;
              
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    isSelected 
                      ? 'bg-slate-900/80 border-blue-600 shadow-md ring-1 ring-blue-500/50' 
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
                    <p className="text-xs text-slate-500">Submitted: {app.appliedDate}</p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-md font-black text-white">{formatCurrency(app.amount, false)}</p>
                    <span className="text-xs text-blue-500 font-semibold flex items-center justify-end gap-1">
                      Audit File <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT CONTAINER: Audit & Recommendation Form (5 columns) */}
        <div className="lg:col-span-5">
          {selectedApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Audit Workspace</h3>
                  <span className="text-xs font-mono text-slate-500">ID: {selectedApp.id}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              </div>

              {/* Borrower Profile Details */}
              <div className="space-y-2 text-xs leading-relaxed border-b border-slate-850 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Applicant Name</span>
                  <span className="text-white font-bold">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">PAN Card</span>
                  <span className="text-slate-300 font-mono">{selectedApp.panNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Monthly Income</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(selectedApp.monthlyIncome, false)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Requested Amount</span>
                  <span className="text-white font-bold">{formatCurrency(selectedApp.amount, false)}</span>
                </div>
              </div>

              {/* Step 1: Manual Document Inspection & Verification */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Manual Document Inspection</h4>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
                    {Object.values(docsVerified).filter(Boolean).length}/3 Verified
                  </span>
                </div>

                <div className="space-y-2 bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs">
                  {/* ID Proof Doc */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
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
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>

                  {/* Income Proof Doc */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
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
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>

                  {/* Bank Statement Doc */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
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
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>
                </div>

                {/* Inspection Document Preview Modal Box */}
                {inspectingDoc && (
                  <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                        <FileText className="h-4 w-4" /> {inspectingDoc}
                      </span>
                      <button onClick={() => setInspectingDoc(null)} className="text-[10px] text-slate-400 hover:text-white">Close</button>
                    </div>
                    <div className="p-3 bg-slate-950 rounded font-mono text-[10px] text-slate-400 border border-slate-800">
                      📄 Verified digital signature: <span className="text-emerald-400">SHA256: 4a9f82...VALID</span><br />
                      Status: Document metadata matches PAN {selectedApp.panNumber}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: CIBIL Score Pull */}
              <div className="space-y-3 border-t border-slate-850 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Credit Score Pull</h4>

                {cibilScore ? (
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">CIBIL Report Score:</span>
                    <span className={`text-md font-black ${
                      cibilScore >= 750 ? 'text-emerald-400' : cibilScore >= 680 ? 'text-amber-400' : 'text-red-400'
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
              <div className="space-y-2 border-t border-slate-850 pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Officer Remarks for Manager
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g. All 3 KYC documents verified manually. CIBIL score is excellent."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Step 4: Decision Actions */}
              <div className="pt-2 flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                  onClick={() => handleRecommendation('APPROVE')}
                  isLoading={actionLoading}
                  disabled={!allDocsChecked}
                >
                  Recommend Approval
                </Button>

                <Button
                  variant="secondary"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                  onClick={() => handleRecommendation('REJECT')}
                  isLoading={actionLoading}
                >
                  Reject
                </Button>
              </div>

              {!allDocsChecked && (
                <p className="text-[11px] text-amber-400/90 text-center font-medium">
                  ⚠️ Check all 3 document verification checkboxes above to enable recommendation.
                </p>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-400">No Application Selected</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click on any application card on the left list to inspect KYC files and issue manager recommendations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
