import { useState, useEffect } from 'react';
import { X, LifeBuoy, Send, CheckCircle2, Phone, Mail, HelpCircle, ShieldCheck, MessageSquare, Clock, ArrowLeft, User, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { ticketStore } from '../../utils/ticketStore';

/**
 * ============================================================
 * HELP CENTER MODAL OVERLAY (LIGHT THEME)
 * Multi-turn Support Chat between Borrower and Loan Officer.
 * ============================================================
 */
export default function HelpCenterModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('Chat');
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [ticketForm, setTicketForm] = useState({ category: 'EMI', subject: '', description: '' });
  const [ticketSubmittedMsg, setTicketSubmittedMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = async () => {
    setIsLoading(true);
    const data = await ticketStore.getTickets(false);
    setTickets(data);
    if (data.length > 0) {
      const targetId = selectedTicketId || data[0].id;
      setSelectedTicketId(targetId);
      ticketStore.markAsRead(targetId);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const handleSelectTicket = (tId) => {
    setSelectedTicketId(tId);
    ticketStore.markAsRead(tId);
    setTickets(ticketStore.getLocalTickets());
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;

    setIsLoading(true);
    const newTicket = await ticketStore.createTicket({
      category: ticketForm.category,
      subject: ticketForm.subject,
      description: ticketForm.description,
      borrowerName: 'Rahul Sharma',
    });

    const refreshed = await ticketStore.getTickets(false);
    setTickets(refreshed);
    if (newTicket) {
      setSelectedTicketId(newTicket.id || newTicket.ticketId);
    }
    setTicketForm({ category: 'EMI', subject: '', description: '' });
    setTicketSubmittedMsg('Query submitted! Your Loan Officer will reply shortly.');
    setActiveTab('Chat');
    setIsLoading(false);
    setTimeout(() => setTicketSubmittedMsg(''), 5000);
  };

  const handleSendBorrowerReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    setIsLoading(true);
    await ticketStore.addMessage(selectedTicketId, {
      text: replyText,
      senderRole: 'BORROWER',
      senderName: 'Rahul Sharma',
    });

    const refreshed = await ticketStore.getTickets(false);
    setTickets(refreshed);
    setReplyText('');
    setIsLoading(false);
  };

  const handleMarkResolved = async (tId) => {
    setIsLoading(true);
    await ticketStore.updateStatus(tId, 'RESOLVED');
    const refreshed = await ticketStore.getTickets(false);
    setTickets(refreshed);
    setIsLoading(false);
  };

  const currentTicket = tickets.find(t => t.id === selectedTicketId || t.ticketId === selectedTicketId) || tickets[0];
  const isOfficerReplied = currentTicket && (currentTicket.status === 'OFFICER_REPLIED' || currentTicket.status === 'IN_PROGRESS');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 relative border border-slate-200 text-slate-900">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 block mb-1">
              SUPPORT & OFFICER CHAT HELPDESK
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-indigo-600" />
              Help & Support Center
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assigned Relationship Manager Box */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Loan Officer</span>
            <h4 className="text-sm font-bold text-slate-900">Amit Kumar (Senior Credit Advisor)</h4>
            <p className="text-slate-500 mt-0.5 font-medium">Direct Line: +91 98765 43210 • Email: rm.mumbai@loanvault.com</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => alert('Call initiated to Loan Officer: +91 98765 43210')}>
            Call Officer
          </Button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab('Chat')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'Chat' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Query Threads & Chat ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('NewTicket')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'NewTicket' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="h-4 w-4" />
            Raise New Query
          </button>
        </div>

        {ticketSubmittedMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{ticketSubmittedMsg}</span>
          </div>
        )}

        {/* TAB 1: CONTINUOUS CHAT */}
        {activeTab === 'Chat' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Tickets List */}
            <div className="md:col-span-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Your Queries</span>
              {tickets.map(t => {
                const isSelected = selectedTicketId === t.id || selectedTicketId === t.ticketId;
                const hasUnread = t.messages && t.messages.some(m => m.senderRole === 'OFFICER' && !m.isRead);

                return (
                  <div
                    key={t.id || t.ticketId}
                    onClick={() => handleSelectTicket(t.id || t.ticketId)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1 relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-slate-900 shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {hasUnread && (
                      <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                    <div className="flex justify-between items-center pr-3">
                      <span className="font-mono text-[10px] font-bold text-indigo-600">{t.ticketId || t.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : t.status === 'OFFICER_REPLIED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : t.status === 'REOPENED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 truncate">{t.subject}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{t.createdAt}</p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Chat Box Messages */}
            <div className="md:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col h-96">
              {currentTicket ? (
                <>
                  <div className="border-b border-slate-200 pb-3 mb-2 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{currentTicket.subject}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">Ticket ID: {currentTicket.ticketId || currentTicket.id} • Category: {currentTicket.category}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      currentTicket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : currentTicket.status === 'OFFICER_REPLIED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : currentTicket.status === 'REOPENED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {currentTicket.status}
                    </span>
                  </div>

                  {isOfficerReplied && (
                    <div className="mb-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span className="font-semibold">Did this officer response resolve your issue?</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkResolved(currentTicket.id || currentTicket.ticketId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-1 px-2.5 h-auto font-bold cursor-pointer"
                      >
                        ✓ Yes, Mark Resolved
                      </Button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    {currentTicket.messages && currentTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.senderRole === 'BORROWER' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                          m.senderRole === 'BORROWER'
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex justify-between items-center gap-4 text-[10px] text-slate-300 font-semibold border-b border-white/10 pb-1 mb-1">
                            <span>{m.senderName}</span>
                            <span className="text-[9px] opacity-75">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentTicket.status !== 'CLOSED' ? (
                    <form onSubmit={handleSendBorrowerReply} className="mt-2 pt-2 border-t border-slate-200 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a follow-up message to your Officer..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                      />
                      <Button type="submit" variant="primary" size="sm" leftIcon={Send} isLoading={isLoading}>
                        Send
                      </Button>
                    </form>
                  ) : (
                    <div className="p-2 text-center text-slate-500 text-xs font-medium border-t border-slate-200">
                      This support ticket has been closed.
                    </div>
                  )}
                </>
              ) : (
                <div className="m-auto text-center text-slate-400 text-xs font-medium">
                  No query selected. Raise a new query to start chatting!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RAISE NEW QUERY FORM */}
        {activeTab === 'NewTicket' && (
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raise New Support Query</h4>

            <Select
              label="Category"
              id="category"
              options={[
                { value: 'EMI', label: 'EMI Payment Issue' },
                { value: 'DOCUMENT', label: 'Document & KYC Query' },
                { value: 'ACCOUNT', label: 'Account & Loan Status Request' },
              ]}
              value={ticketForm.category}
              onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
            />

            <Input
              label="Subject"
              id="subject"
              type="text"
              placeholder="e.g. EMI payment auto-debit clarification"
              value={ticketForm.subject}
              onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Query Message</label>
              <textarea
                rows={4}
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Type your detailed message to your Loan Officer..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={Send} isLoading={isLoading}>
                Submit Query to Officer
              </Button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Help Center
          </Button>
        </div>
      </div>
    </div>
  );
}
