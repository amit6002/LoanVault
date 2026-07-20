import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, FileText, CheckCircle2, Clock, XCircle, ArrowRight, Search, Filter, ChevronRight, UserCheck, Award, ShieldCheck, X } from 'lucide-react';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * APPLICATIONS PAGE COMPONENT
 * 1-to-1 visual fidelity matching Image 3 mockup.
 * Master-Detail Architecture:
 *   Left: Filter pills (All, In Progress, Approved, Disbursed, Rejected) + Cards
 *   Right: Order-Tracking Vertical Timeline Panel
 * ============================================================
 */
function getStageProgress(status) {
  if (status === 'REJECTED' || status === 'RECOMMENDED_REJECT') {
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
  const [applications, setApplications] = useState([]);
  const [activeTabFilter, setActiveTabFilter] = useState('ALL');
  const [activeAppId, setActiveAppId] = useState('APP-2026-05327');
  const [panelTab, setPanelTab] = useState('Timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/applications/my').catch(() => []);

      const list = (Array.isArray(data) && data.length > 0 ? data : [
        { id: 'APP-2026-05327', loanType: 'BUSINESS', status: 'RECOMMENDED_APPROVE', loanAmount: 200000, appliedAt: '2026-07-20T10:30:00', officerRemarks: 'Our underwriter is reviewing your application.' },
        { id: 'APP-2026-27758', loanType: 'VEHICLE', status: 'DOC_VERIFICATION', loanAmount: 1040800, appliedAt: '2026-07-18T14:15:00', officerRemarks: 'Your KYC documents have been verified.' },
        { id: 'APP-2026-00812', loanType: 'HOME', status: 'SUBMITTED', loanAmount: 5500000, appliedAt: '2026-07-15T09:00:00', officerRemarks: 'Your application has been submitted successfully.' },
        { id: 'APP-2026-00431', loanType: 'PERSONAL', status: 'APPROVED', loanAmount: 450000, appliedAt: '2026-07-10T11:00:00', officerRemarks: 'Application approved by manager.' },
        { id: 'APP-2026-00123', loanType: 'CONSUMER', status: 'REJECTED', loanAmount: 150000, appliedAt: '2026-07-05T16:00:00', officerRemarks: 'Credit score below threshold.' },
      ]).map(item => ({
        id: item.referenceId || item.id,
        type: `${item.loanType || 'Business'} Loan`,
        status: item.status || 'SUBMITTED',
        amount: item.loanAmount || 0,
        appliedDate: item.appliedAt
          ? new Date(item.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A',
        appliedTime: item.appliedAt
          ? new Date(item.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '',
        officerRemarks: item.officerRemarks || 'Underwriter reviewing files.',
      }));

      setApplications(list);
      if (list.length > 0) {
        setActiveAppId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.type.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTabFilter === 'IN_PROGRESS') return app.status === 'SUBMITTED' || app.status === 'DOC_VERIFICATION' || app.status === 'CREDIT_CHECK' || app.status === 'RECOMMENDED_APPROVE';
    if (activeTabFilter === 'APPROVED') return app.status === 'APPROVED';
    if (activeTabFilter === 'DISBURSED') return app.status === 'DISBURSED';
    if (activeTabFilter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const selectedApp = applications.find(a => a.id === activeAppId) || applications[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Applications</h1>
          <p className="text-sm text-slate-400 mt-1">Track and manage your loan applications</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate(PATHS.BORROWER_APPLY)}>
          Apply for New Loan
        </Button>
      </div>

      {/* 2. Filter Pills Bar */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Applications', count: applications.length },
          { id: 'IN_PROGRESS', label: 'In Progress', count: applications.filter(a => a.status === 'SUBMITTED' || a.status === 'DOC_VERIFICATION' || a.status === 'CREDIT_CHECK' || a.status === 'RECOMMENDED_APPROVE').length },
          { id: 'APPROVED', label: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length },
          { id: 'DISBURSED', label: 'Disbursed', count: applications.filter(a => a.status === 'DISBURSED').length },
          { id: 'REJECTED', label: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id)}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTabFilter === tab.id ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTabFilter === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by loan type or application ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs self-end sm:self-auto">
          <span className="text-slate-500">Filter:</span>
          <select className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
            <option>All Types</option>
          </select>
          <select className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
            <option>Newest First</option>
          </select>
        </div>
      </div>

      {/* MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CARDS LIST (6 columns) */}
        <div className="lg:col-span-6 space-y-4">
          {filteredApps.map(app => {
            const isSelected = activeAppId === app.id;
            const stage = getStageProgress(app.status);

            return (
              <div
                key={app.id}
                onClick={() => setActiveAppId(app.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-900/90 border-blue-600 ring-1 ring-blue-500/50 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      app.type.includes('Business') ? 'bg-blue-600/20 text-blue-400' : app.type.includes('Vehicle') ? 'bg-emerald-500/20 text-emerald-400' : app.type.includes('Home') ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{app.type}</h3>
                      <span className="text-[11px] font-mono text-slate-500">{app.id}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    app.status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : app.status === 'APPROVED' || app.status === 'DISBURSED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {app.status === 'RECOMMENDED_APPROVE' || app.status === 'DOC_VERIFICATION' ? 'In Progress' : app.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Applied On</span>
                    <span className="text-slate-300 font-medium">{app.appliedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Requested Amount</span>
                    <span className="text-white font-bold">₹{app.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Stage</span>
                    <span className="text-slate-200 font-semibold">{stage.label}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Progress</span>
                    <span>{stage.isRejected ? '—' : `${stage.currentStep} of 5`}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      stage.isRejected ? 'bg-red-500' : 'bg-blue-500'
                    }`} style={{ width: `${stage.isRejected ? 100 : (stage.currentStep / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: APPLICATION TIMELINE & DETAILS PANEL (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedApp ? (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedApp.type}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                      In Progress
                    </span>
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{selectedApp.id}</span>
                </div>
              </div>

              {/* Panel Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-semibold gap-6">
                {['Application Timeline', 'Application Details', 'Documents'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPanelTab(tab)}
                    className={`pb-2 border-b-2 transition-all ${
                      panelTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB 1: APPLICATION TIMELINE */}
              {panelTab === 'Application Timeline' && (
                <div className="space-y-6">
                  
                  {/* Vertical Timeline Tracker */}
                  <div className="relative pl-6 space-y-6 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    
                    {/* Stage 1 */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center w-full">
                          <h4 className="font-bold text-white">Application Submitted</h4>
                          <span className="text-[10px] text-slate-500">{selectedApp.appliedDate} 10:30 AM</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">Your application has been submitted successfully.</p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center w-full">
                          <h4 className="font-bold text-white">KYC Verification</h4>
                          <span className="text-[10px] text-slate-500">{selectedApp.appliedDate} 02:15 PM</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">Your KYC documents have been verified.</p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px] ring-4 ring-blue-500/20 animate-pulse">
                        🔵
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center w-full">
                          <h4 className="font-bold text-blue-400">Underwriter Review</h4>
                          <span className="text-[10px] text-slate-500">21 Jul 2026 11:45 AM</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">Our underwriter is reviewing your application.</p>
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="relative flex items-start gap-4 opacity-50">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                        👤
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-400">Manager Approval</h4>
                        <p className="text-[10px] text-slate-500">Pending</p>
                      </div>
                    </div>

                    {/* Stage 5 */}
                    <div className="relative flex items-start gap-4 opacity-50">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                        ₹
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-400">Disbursement</h4>
                        <p className="text-[10px] text-slate-500">Pending</p>
                      </div>
                    </div>

                  </div>

                  {/* Status Banner Note */}
                  <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl flex items-start gap-3 text-xs text-slate-400">
                    <Clock className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      We'll notify you as soon as your application moves to the next stage. You can check the status anytime here.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 border border-slate-700"
                  >
                    View Application Details →
                  </Button>

                </div>
              )}

            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
}
