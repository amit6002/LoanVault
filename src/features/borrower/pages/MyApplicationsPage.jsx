import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, FileText, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY APPLICATIONS PAGE COMPONENT (Borrower Portal)
 * Fetches applications from Spring Boot REST API /api/applications/my
 * Displays real-time status updates (SUBMITTED → RECOMMENDED → APPROVED → DISBURSED)
 * as Loan Officers & Managers process them.
 * ============================================================
 */
export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
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
      // Fetch from Spring Boot API — single source of truth
      const data = await api.get('/api/applications/my');

      const formatted = (Array.isArray(data) ? data : []).map(item => ({
        id: item.referenceId || item.id,
        type: item.loanType || 'PERSONAL',
        amount: item.loanAmount || 0,
        tenureMonths: item.tenureMonths || 0,
        status: item.status || 'SUBMITTED',
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
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

            return (
              <div
                key={app.id}
                className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4 hover:border-slate-750 transition-all"
              >
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

                {/* Status remarks banner */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    System Note:
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    {app.remarks}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Applied: {app.appliedDate}</span>
                  <span className="text-blue-500 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
