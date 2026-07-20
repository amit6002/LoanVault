import { useState, useEffect } from 'react';
import { Landmark, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck, MessageSquare, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import { ticketStore } from '../../../utils/ticketStore';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN OFFICER DASHBOARD COMPONENT
 * Features real-time Borrower Support Queries Chat Panel
 * where Loan Officer can view and reply to borrower queries.
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

  const loadOfficerTickets = () => {
    const data = ticketStore.getTickets();
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id);
    }
  };

  const handleSendOfficerReply = (e) => {
    e.preventDefault();
    if (!officerReply.trim() || !selectedTicketId) return;

    const updated = ticketStore.addReply(selectedTicketId, {
      text: officerReply,
      sender: 'OFFICER',
      senderName: officerName,
    });

    setTickets(updated);
    setOfficerReply('');
  };

  const currentTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {officerName}
          </h1>
          <p className="text-sm text-slate-400">
            Workload Status: <span className="text-amber-500 font-semibold">Active Review & Support Session</span>
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
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><Clock className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : `${pendingCount} Cases`}
          </p>
        </div>

        {/* Support Queries Inbox */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20"><MessageSquare className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrower Queries</p>
          <p className="text-2xl font-black text-amber-500">{tickets.length} Tickets</p>
        </div>

        {/* Verified Today */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Today</p>
          <p className="text-2xl font-black text-emerald-400">8 Cases</p>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/20"><ShieldCheck className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Pass Rate</p>
          <p className="text-2xl font-black text-white">96.5%</p>
        </div>

      </div>

      {/* 3. BORROWER SUPPORT QUERIES & OFFICER CHAT PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Borrower Helpdesk & Support Queries Inbox
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {tickets.filter(t => t.status !== 'RESOLVED').length} Active Open Queries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Tickets Queue List (4 cols) */}
          <div className="md:col-span-4 space-y-3 max-h-96 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Incoming Borrower Queries</span>
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                  selectedTicketId === t.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-blue-400">{t.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h5 className="font-bold text-slate-200 truncate">{t.subject}</h5>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>{t.borrowerName}</span>
                  <span>{t.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Officer Chat Thread Box (8 cols) */}
          <div className="md:col-span-8 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col h-96">
            {currentTicket ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">{currentTicket.subject}</h4>
                    <p className="text-[11px] text-slate-400">
                      Borrower: <span className="text-white font-semibold">{currentTicket.borrowerName}</span> ({currentTicket.borrowerEmail})
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{currentTicket.id}</span>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                  {currentTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'OFFICER' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                        m.sender === 'OFFICER'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                      }`}>
                        <div className="flex justify-between items-center gap-4 text-[10px] text-slate-300 font-semibold border-b border-white/10 pb-1 mb-1">
                          <span>{m.senderName}</span>
                          <span className="text-[9px] opacity-75">{m.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Officer Reply Form */}
                <form onSubmit={handleSendOfficerReply} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official response to Borrower..."
                    value={officerReply}
                    onChange={(e) => setOfficerReply(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <Button type="submit" variant="primary" size="sm" leftIcon={Send}>
                    Send Reply
                  </Button>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-slate-500 text-xs">
                No active support queries selected.
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
