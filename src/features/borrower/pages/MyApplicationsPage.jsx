import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, Plus, FileText, CheckCircle2, Clock, XCircle, ArrowRight, 
  Search, Filter, ChevronRight, UserCheck, Award, ShieldCheck, X, User, 
  DollarSign, Calendar, AlertCircle 
} from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';
import PageSkeletonLoader from '../../../components/common/PageSkeletonLoader';

function getStageProgress(status) {
  if (status === 'REJECTED' || status === 'RECOMMENDED_REJECT' || status === 'CANCELLED') {
    return { currentStep: 0, isRejected: true, label: 'Rejected' };
  }

  switch (status) {
    case 'SUBMITTED':
      return { currentStep: 1, isRejected: false, label: 'Application Submitted' };
    case 'DOC_VERIFICATION':
      return { currentStep: 2, isRejected: false, label: 'KYC Verification' };
    case 'CREDIT_CHECK':
      return { currentStep: 3, isRejected: false, label: 'Underwriter Review' };
    case 'UNDER_REVIEW':
    case 'RECOMMENDED_APPROVE':
      return { currentStep: 4, isRejected: false, label: 'Manager Approval' };
    case 'APPROVED':
    case 'DISBURSEMENT_PENDING':
    case 'DISBURSED':
      return { currentStep: 5, isRejected: false, label: 'Disbursement' };
    default:
      return { currentStep: 1, isRejected: false, label: 'Submitted' };
  }
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [activeTabFilter, setActiveTabFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const [selectedApp, setSelectedApp] = useState(null);
  const [modalTab, setModalTab] = useState('Timeline');
  const [isLoading, setIsLoading] = useState(true);

  // Lock background page scroll when pop-up modal is open
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

  const MOCK_DEMO_APPS = [
    {
      id: 'APP-9021',
      type: 'Business Expansion Loan',
      rawType: 'BUSINESS',
      amount: 500000,
      appliedDate: '18 Jul 2026',
      appliedTime: '10:30 AM',
      status: 'DOC_VERIFICATION',
      officerRemarks: 'KYC documents under review by Loan Officer.',
      tenure: 36,
      purpose: 'Working capital requirement for inventory purchase',
    },
    {
      id: 'APP-7814',
      type: 'Home Renovation Loan',
      rawType: 'HOME',
      amount: 750000,
      appliedDate: '05 Jul 2026',
      appliedTime: '03:15 PM',
      status: 'APPROVED',
      officerRemarks: 'Sanction letter issued. Disbursement pending bank mandate.',
      tenure: 48,
      purpose: 'Interior remodeling and roofing repairs',
    },
    {
      id: 'APP-6209',
      type: 'Vehicle Purchase Loan',
      rawType: 'VEHICLE',
      amount: 320000,
      appliedDate: '24 Jun 2026',
      appliedTime: '11:00 AM',
      status: 'DISBURSED',
      officerRemarks: 'Disbursed into account XXXX9012.',
      tenure: 24,
      purpose: 'Commercial vehicle purchase',
    },
  ];

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/applications/my').catch(() => null);
      if (res && Array.isArray(res)) {
        // Map backend LoanApplication entity fields to frontend shape
        const mapped = res.map(item => ({
          id: item.referenceId || String(item.id),
          type: item.loanType
            ? item.loanType.charAt(0) + item.loanType.slice(1).toLowerCase().replace('_', ' ') + ' Loan'
            : 'Personal Loan',
          rawType: item.loanType || 'PERSONAL',
          amount: item.loanAmount || 0,
          appliedDate: item.appliedAt
            ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A',
          appliedTime: item.appliedAt
            ? new Date(item.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '',
          status: item.status || 'SUBMITTED',
          officerRemarks: item.officerRemarks || item.managerRemarks || 'Application is being processed.',
          tenure: item.tenureMonths || 0,
          purpose: item.purpose || (item.loanType ? `${item.loanType} loan purpose` : 'General purpose'),
        }));
        setApplications(mapped);
      } else {
        // Fallback for offline mode: show demo apps only for demo borrower profile
        const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
        if (session.email === 'borrower@loanvault.com') {
          setApplications(MOCK_DEMO_APPS);
        } else {
          setApplications([]);
        }
      }
    } catch (err) {
      console.warn('API error:', err);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (typeFilter !== 'ALL' && app.rawType !== typeFilter) return false;

    if (activeTabFilter === 'IN_PROGRESS')
      return (
        app.status === 'SUBMITTED' ||
        app.status === 'PENDING_ASSIGNMENT' ||
        app.status === 'DOC_VERIFICATION' ||
        app.status === 'CREDIT_CHECK' ||
        app.status === 'UNDER_REVIEW' ||
        app.status === 'RECOMMENDED_APPROVE' ||
        app.status === 'DISBURSEMENT_PENDING'
      );
    if (activeTabFilter === 'APPROVED') return app.status === 'APPROVED';
    if (activeTabFilter === 'DISBURSED') return app.status === 'DISBURSED';
    // REJECTED tab: show both REJECTED and RECOMMENDED_REJECT
    if (activeTabFilter === 'REJECTED')
      return app.status === 'REJECTED' || app.status === 'RECOMMENDED_REJECT';
    return true;
  });

  if (isLoading) {
    return <PageSkeletonLoader title="Loading Loan Applications & Underwriting Stages..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Loan Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Track underwriting progress and application status</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate(PATHS.BORROWER_APPLY)}>
          Apply for New Loan
        </Button>
      </div>

      {/* 2. Filter Pills Bar */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Applications', count: applications.length },
          {
            id: 'IN_PROGRESS',
            label: 'In Progress',
            count: applications.filter(
              (a) =>
                a.status === 'SUBMITTED' ||
                a.status === 'PENDING_ASSIGNMENT' ||
                a.status === 'DOC_VERIFICATION' ||
                a.status === 'CREDIT_CHECK' ||
                a.status === 'UNDER_REVIEW' ||
                a.status === 'RECOMMENDED_APPROVE' ||
                a.status === 'DISBURSEMENT_PENDING'
            ).length,
          },
          { id: 'APPROVED', label: 'Approved', count: applications.filter((a) => a.status === 'APPROVED').length },
          { id: 'DISBURSED', label: 'Disbursed', count: applications.filter((a) => a.status === 'DISBURSED').length },
          // Count both REJECTED and RECOMMENDED_REJECT under the Rejected tab
          { id: 'REJECTED', label: 'Rejected', count: applications.filter((a) => a.status === 'REJECTED' || a.status === 'RECOMMENDED_REJECT').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id)}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTabFilter === tab.id
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTabFilter === tab.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by application ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs self-end sm:self-auto">
          <span className="text-slate-500 font-medium">Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Loan Types</option>
            <option value="BUSINESS">Business Loan</option>
            <option value="VEHICLE">Vehicle Loan</option>
            <option value="HOME">Home Loan</option>
            <option value="PERSONAL">Personal Loan</option>
          </select>
        </div>
      </div>

      {/* 4. APPLICATION CARDS GRID */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-4 shadow-xs">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No applications match your filter</h3>
          <Button variant="primary" onClick={() => navigate(PATHS.BORROWER_APPLY)}>
            Apply for New Loan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApps.map((app) => {
            const stage = getStageProgress(app.status);

            return (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedApp(app);
                  setModalTab('Timeline');
                }}
                className="p-6 bg-white border border-slate-200/80 hover:border-indigo-500/50 rounded-2xl space-y-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group shadow-card"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {app.type}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{app.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      app.status === 'REJECTED' || app.status === 'RECOMMENDED_REJECT'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : app.status === 'APPROVED' || app.status === 'DISBURSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {(() => {
                      switch (app.status) {
                        case 'SUBMITTED': return 'Submitted';
                        case 'PENDING_ASSIGNMENT': return 'Pending Assignment';
                        case 'DOC_VERIFICATION': return 'In Progress';
                        case 'CREDIT_CHECK': return 'Credit Check';
                        case 'UNDER_REVIEW': return 'Under Review';
                        case 'RECOMMENDED_APPROVE': return 'In Progress';
                        case 'RECOMMENDED_REJECT': return 'Rejected';
                        case 'APPROVED': return 'Approved';
                        case 'DISBURSEMENT_PENDING': return 'In Progress';
                        case 'DISBURSED': return 'Disbursed';
                        case 'REJECTED': return 'Rejected';
                        case 'CANCELLED': return 'Cancelled';
                        default: return app.status;
                      }
                    })()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Applied On</span>
                    <span className="text-slate-700 font-semibold">{app.appliedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(app.amount, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Stage</span>
                    <span className="text-slate-700 font-semibold">{stage.label}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Progress</span>
                    <span>{stage.isRejected ? '—' : `${stage.currentStep} of 5`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.isRejected ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${stage.isRejected ? 100 : (stage.currentStep / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Timeline & Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILS & TIMELINE POP-UP MODAL WINDOW */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden no-scrollbar shadow-2xl space-y-6 p-6 sm:p-8 relative text-slate-900 animate-modal-scale">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 block mb-1">
                  APPLICATION ID: {selectedApp.id}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  {selectedApp.type}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
              {['Timeline', 'Details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    modalTab === tab
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'Timeline' ? 'Application Timeline' : 'Application Details'}
                </button>
              ))}
            </div>

            {/* TAB 1: ORDER TRACKING TIMELINE — Dynamic based on real status */}
            {modalTab === 'Timeline' && (() => {
              const st = selectedApp.status;
              const isRejected = st === 'REJECTED' || st === 'RECOMMENDED_REJECT' || st === 'CANCELLED';
              const isDisbursed = st === 'DISBURSED';
              const step2Done = ['DOC_VERIFICATION','CREDIT_CHECK','UNDER_REVIEW','RECOMMENDED_APPROVE','RECOMMENDED_REJECT','APPROVED','DISBURSEMENT_PENDING','DISBURSED','REJECTED'].includes(st);
              const step3Done = ['UNDER_REVIEW','RECOMMENDED_APPROVE','RECOMMENDED_REJECT','APPROVED','DISBURSEMENT_PENDING','DISBURSED','REJECTED'].includes(st);
              const step4Done = ['RECOMMENDED_APPROVE','APPROVED','DISBURSEMENT_PENDING','DISBURSED'].includes(st);
              const step4Rejected = st === 'RECOMMENDED_REJECT' || st === 'REJECTED';
              const step5Done = isDisbursed;

              const GreenNode = () => <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold text-[10px]">✓</div>;
              const BlueNode = () => <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-indigo-100 animate-pulse text-[10px]">●</div>;
              const RedNode  = () => <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-extrabold text-[10px]">✕</div>;
              const GreyNode = () => <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">○</div>;

              return (
                <div className="space-y-6">
                  <div className="relative pl-6 space-y-6 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">

                    {/* Step 1: Submitted — always green */}
                    <div className="relative flex items-start gap-4">
                      <GreenNode />
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-900">Application Submitted</h4>
                          <span className="text-[10px] text-slate-400">{selectedApp.appliedDate} {selectedApp.appliedTime}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">Application received with reference ID {selectedApp.id}.</p>
                      </div>
                    </div>

                    {/* Step 2: KYC / Doc Verification */}
                    <div className="relative flex items-start gap-4">
                      {step2Done ? <GreenNode /> : isRejected ? <RedNode /> : <BlueNode />}
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold ${step2Done ? 'text-slate-900' : isRejected ? 'text-rose-700' : 'text-indigo-600'}`}>KYC Document Verification</h4>
                          <span className="text-[10px] text-slate-400">{step2Done ? 'Completed' : isRejected ? 'Not Required' : 'In Progress'}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">Officer reviews PAN, income proof, and bank statements.</p>
                      </div>
                    </div>

                    {/* Step 3: Credit Check */}
                    <div className="relative flex items-start gap-4">
                      {step3Done ? <GreenNode /> : step2Done && !isRejected ? <BlueNode /> : <GreyNode />}
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold ${step3Done ? 'text-slate-900' : step2Done && !isRejected ? 'text-indigo-600' : 'text-slate-400'}`}>Underwriter Credit Review</h4>
                          <span className="text-[10px] text-slate-400">{step3Done ? 'Completed' : step2Done && !isRejected ? 'Currently Processing' : 'Upcoming'}</span>
                        </div>
                        {step3Done && selectedApp.officerRemarks && !isRejected && (
                          <p className="text-slate-600 text-[11px] bg-indigo-50 border border-indigo-100 rounded-lg p-2 mt-1 italic">
                            Officer: "{selectedApp.officerRemarks}"
                          </p>
                        )}
                        {!step3Done && <p className="text-slate-400 text-[11px]">CIBIL bureau score pulled and analysed by officer.</p>}
                      </div>
                    </div>

                    {/* Step 4: Manager Approval */}
                    <div className="relative flex items-start gap-4">
                      {step4Done ? <GreenNode /> : step4Rejected ? <RedNode /> : step3Done ? <BlueNode /> : <GreyNode />}
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold ${step4Done ? 'text-slate-900' : step4Rejected ? 'text-rose-700' : step3Done ? 'text-indigo-600' : 'text-slate-400'}`}>
                            Manager Sanction
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {step4Done ? 'Approved ✓' : step4Rejected ? 'Rejected' : step3Done ? 'Pending Decision' : 'Upcoming'}
                          </span>
                        </div>
                        {step4Rejected && (
                          <p className="text-rose-600 text-[11px] bg-rose-50 border border-rose-100 rounded-lg p-2 mt-1">
                            ❌ {selectedApp.officerRemarks || 'Application was not approved after review.'}
                          </p>
                        )}
                        {!step4Done && !step4Rejected && <p className="text-slate-400 text-[11px]">Final sanction decision by Branch Manager.</p>}
                      </div>
                    </div>

                    {/* Step 5: Disbursement */}
                    <div className="relative flex items-start gap-4">
                      {step5Done ? <GreenNode /> : step4Done ? <BlueNode /> : <GreyNode />}
                      <div className="space-y-0.5 w-full">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold ${step5Done ? 'text-emerald-700' : step4Done ? 'text-indigo-600' : 'text-slate-400'}`}>
                            Loan Disbursed
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {step5Done ? '✓ Funds Released' : step4Done ? 'Disbursement in Progress' : 'Upcoming'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {step5Done
                            ? 'Loan amount has been credited to your registered bank account.'
                            : 'Funds will be transferred to your bank account upon final sanction.'}
                        </p>
                      </div>
                    </div>

                  </div>

                  {!isRejected && !isDisbursed && (
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
                      <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">We will notify you as soon as your application moves to the next stage.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB 2: FULL APPLICATION DETAILS */}
            {modalTab === 'Details' && (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Financial Proposal Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Amount</span>
                      <span className="text-slate-900 font-bold text-sm">{formatCurrency(selectedApp.amount, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenure</span>
                      <span className="text-slate-800 font-bold">{selectedApp.tenure} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                      <span className="text-slate-700 font-medium">{selectedApp.purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Applied Date</span>
                      <span className="text-slate-700 font-medium">{selectedApp.appliedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
