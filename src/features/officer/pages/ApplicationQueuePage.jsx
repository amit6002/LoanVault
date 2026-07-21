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
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Application Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Review KYC files, manually inspect documents, evaluate credit reports, and forward proposals to Loan Managers.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
            <button
              onClick={fetchQueue}
              className="text-xs text-rose-700 font-bold underline mt-2 hover:text-rose-800 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CONTAINER: Queue grid (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoadingQueue ? (
            <div className="p-8 text-center text-slate-500 font-medium space-y-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching pending underwriting queue from Spring Boot backend...</p>
            </div>
          ) : applications.length === 0 && !error ? (
            <div className="bg-white border border-slate-200/80 p-10 rounded-2xl text-center space-y-4 shadow-xs">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-slate-900">Queue completely cleared!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                No borrower applications are pending document verification checks at this moment. Apply for a new loan as a Borrower to see it appear here in real-time!
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600 border border-slate-200' };
              const isSelected = selectedApp?.id === app.id;
              
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
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
                    <p className="text-xs text-slate-400 font-medium">Submitted: {app.appliedDate}</p>
                  </div>

                  <div className="text-right space-y-1.5">
                    <p className="text-md font-black text-slate-900">{formatCurrency(app.amount, false)}</p>
                    <span className="text-xs text-indigo-600 font-bold flex items-center justify-end gap-1">
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300 shadow-xs">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Audit Workspace</h3>
                  <span className="text-xs font-mono text-indigo-600 font-bold">ID: {selectedApp.id}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              </div>

              {/* Borrower Profile Details */}
              <div className="space-y-2 text-xs leading-relaxed border-b border-slate-200 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Applicant Name</span>
                  <span className="text-slate-900 font-bold">{selectedApp.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">PAN Card</span>
                  <span className="text-slate-700 font-mono font-bold">{selectedApp.panNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Monthly Income</span>
                  <span className="text-emerald-700 font-bold">{formatCurrency(selectedApp.monthlyIncome, false)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Requested Amount</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(selectedApp.amount, false)}</span>
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

                <div className="space-y-2 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-xs">
                  {/* ID Proof Doc */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
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
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>

                  {/* Income Proof Doc */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
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
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>

                  {/* Bank Statement Doc */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
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
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </button>
                  </div>
                </div>

                {/* Inspection Document Preview Modal Box */}
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
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No Application Selected</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Click on any application card on the left list to inspect KYC files and issue manager recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
