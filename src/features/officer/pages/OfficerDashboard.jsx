import { useState, useEffect } from 'react';
import { 
  Landmark, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle, 
  ArrowRight, ShieldCheck, MessageSquare, Send, User, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import { ticketStore } from '../../../utils/ticketStore';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN OFFICER DASHBOARD COMPONENT (LIGHT THEME)
 * Displays application review workloads & borrower support inbox.
 * ============================================================
 */
export default function OfficerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const officerName = session.name || 'Amit Kumar (Loan Officer)';

  const [pendingCount, setPendingCount] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [officerReply, setOfficerReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingQueueCount();
    loadOfficerTickets();
  }, []);

  const fetchPendingQueueCount = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/applications/queue').catch(() => []);
      setPendingCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.warn('Failed to fetch queue count:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfficerTickets = async () => {
    const data = await ticketStore.getTickets(true);
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id || data[0].ticketId);
    }
  };

  const handleSendOfficerReply = async (e) => {
    e.preventDefault();
    if (!officerReply.trim() || !selectedTicketId) return;

    setIsLoading(true);
    await ticketStore.addMessage(selectedTicketId, {
      text: officerReply,
      senderRole: 'OFFICER',
      senderName: officerName,
    });

    const refreshed = await ticketStore.getTickets(true);
    setTickets(refreshed);
    setOfficerReply('');
    setIsLoading(false);
  };

  const currentTicket = tickets.find((t) => (t.id || t.ticketId) === selectedTicketId) || tickets[0];
  const reopenedTicketsCount = tickets.filter((t) => t.status === 'REOPENED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back, {officerName}
          </h1>
          <p className="text-sm text-slate-500">
            Workload Status: <span className="text-amber-700 font-bold">Active Review & Support Session</span>
          </p>
        </div>

        <div className="relative z-10">
          <Button
            variant="primary"
            size="md"
            rightIcon={ArrowRight}
            onClick={() => navigate(PATHS.OFFICER_QUEUE)}
          >
            Open Review Queue
          </Button>
        </div>
      </div>

      {/* 2. Workload Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cases Pending Verification */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Queue</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${pendingCount} Cases`}
          </p>
        </div>

        {/* Support Queries Inbox */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borrower Queries</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-amber-700">{tickets.length} Tickets</p>
            {reopenedTicketsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {reopenedTicketsCount} Reopened
              </span>
            )}
          </div>
        </div>

        {/* Verified Today */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Today</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">8 Cases</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Pass Rate</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">96.5%</p>
        </div>
      </div>

      {/* 3. BORROWER SUPPORT QUERIES & OFFICER CHAT PANEL */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Borrower Helpdesk & Support Queries Inbox
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length} Active Open Queries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tickets Queue List (4 cols) */}
          <div className="md:col-span-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Incoming Borrower Queries</span>
            {tickets.map((t) => {
              const isSelected = selectedTicketId === t.id || selectedTicketId === t.ticketId;
              const isReopened = t.status === 'REOPENED';

              return (
                <div
                  key={t.id || t.ticketId}
                  onClick={() => setSelectedTicketId(t.id || t.ticketId)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500/50 text-slate-900 shadow-xs'
                      : isReopened
                      ? 'bg-amber-50 border-amber-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-indigo-600">{t.ticketId || t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isReopened
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : t.status === 'OFFICER_REPLIED'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 truncate">{t.subject}</h5>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span>{t.borrowerName}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Officer Chat Thread Box (8 cols) */}
          <div className="md:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col h-96">
            {currentTicket ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-200 pb-3 mb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{currentTicket.subject}</h4>
                    <p className="text-[11px] text-slate-500">
                      Borrower: <span className="text-slate-900 font-semibold">{currentTicket.borrowerName}</span> ({currentTicket.borrowerEmail})
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      currentTicket.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentTicket.status === 'REOPENED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200 font-extrabold'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {currentTicket.status}
                  </span>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                  {currentTicket.messages &&
                    currentTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.senderRole === 'OFFICER' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                            m.senderRole === 'OFFICER'
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-4 text-[10px] text-slate-300 font-semibold border-b border-white/10 pb-1 mb-1">
                            <span>{m.senderName}</span>
                            <span className="text-[9px] opacity-75">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Officer Reply Form */}
                <form onSubmit={handleSendOfficerReply} className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official response to Borrower..."
                    value={officerReply}
                    onChange={(e) => setOfficerReply(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  />
                  <Button type="submit" variant="primary" size="sm" leftIcon={Send} isLoading={isLoading}>
                    Send Officer Reply
                  </Button>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-slate-400 text-xs">
                No active support queries selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
