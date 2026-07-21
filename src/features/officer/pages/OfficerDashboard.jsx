import { useState, useEffect } from 'react';
import { 
  Landmark, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle, 
  ArrowRight, ShieldCheck, MessageSquare, Send, User, RefreshCw, X 
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
 * Support queries open in a centered Pop-Up Modal Window.
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

    const refreshed = ticketStore.getLocalTickets();
    setTickets(refreshed);
    setOfficerReply('');
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedTicketId(null);
    setOfficerReply('');
  };

  const currentTicket = selectedTicketId
    ? tickets.find(
        (t) =>
          t.ticketId === selectedTicketId ||
          t.id === selectedTicketId ||
          String(t.id) === String(selectedTicketId) ||
          String(t.ticketId) === String(selectedTicketId)
      )
    : null;

  const reopenedTicketsCount = tickets.filter((t) => t.status === 'REOPENED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-card hover:shadow-lg transition-all">
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Today</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">8 Cases</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-card hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KYC Pass Rate</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">96.5%</p>
        </div>
      </div>

      {/* 3. BORROWER SUPPORT QUERIES CARDS (POPS UP MODAL ON CLICK) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-card">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Borrower Helpdesk & Support Queries Inbox
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any support query below to open the official response pop-up.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono">
            {tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length} Open Queries
          </span>
        </div>

        {/* Grid of Query Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => {
            const isReopened = t.status === 'REOPENED';
            const ticketIdStr = t.ticketId || t.id;

            return (
              <div
                key={ticketIdStr}
                onClick={() => setSelectedTicketId(t.ticketId || t.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-card hover:-translate-y-1 hover:shadow-xl space-y-3 ${
                  isReopened
                    ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                    : t.status === 'RESOLVED'
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-white border-indigo-100 hover:border-indigo-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-indigo-600">{ticketIdStr}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isReopened
                        ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        : t.status === 'OFFICER_REPLIED'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{t.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Borrower: <span className="font-semibold text-slate-700">{t.borrowerName}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                  <span>{t.createdAt}</span>
                  <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View & Reply &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. POP-UP MODAL WINDOW FOR OFFICER SUPPORT CHAT */}
      {selectedTicketId && currentTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 animate-modal-scale relative text-slate-900 max-h-[90vh] flex flex-col no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">{currentTicket.ticketId || currentTicket.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      currentTicket.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentTicket.status === 'REOPENED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {currentTicket.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{currentTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  Borrower: <span className="font-semibold text-slate-800">{currentTicket.borrowerName}</span> ({currentTicket.borrowerEmail || 'rahul.sharma@example.com'})
                </p>
              </div>

              {/* Close Pop-Up Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs max-h-[50vh]">
              {currentTicket.messages && currentTicket.messages.length > 0 ? (
                currentTicket.messages.map((m) => (
                  <div
                    key={m.id || Math.random()}
                    className={`flex flex-col ${m.senderRole === 'OFFICER' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl space-y-1 ${
                        m.senderRole === 'OFFICER'
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
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
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">No messages in thread yet.</div>
              )}
            </div>

            {/* Officer Reply Form Footer */}
            <form onSubmit={handleSendOfficerReply} className="pt-2 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type official response to Borrower..."
                value={officerReply}
                onChange={(e) => setOfficerReply(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
              <Button type="submit" variant="primary" size="md" leftIcon={Send} isLoading={isLoading}>
                Send Officer Reply
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
