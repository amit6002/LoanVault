import { useState, useEffect } from 'react';
import { 
  LifeBuoy, Send, PlusCircle, HelpCircle, CheckCircle2, MessageSquare, 
  Clock, ShieldCheck, User, RefreshCw, AlertCircle 
} from 'lucide-react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import { ticketStore } from '../../../utils/ticketStore';

/**
 * ============================================================
 * FULL HELP CENTER PAGE COMPONENT
 * Provides real-time Borrower Helpdesk, live chat with assigned Loan Officer,
 * support ticket creation, and status workflow.
 * ============================================================
 */
export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('Chat'); // 'Chat' or 'NewTicket'
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    category: 'ACCOUNTS',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { value: 'ACCOUNTS', label: 'Loan Accounts & Balances' },
    { value: 'PAYMENTS', label: 'EMI & Payment Failures' },
    { value: 'STATEMENTS', label: 'Statement / Tax Certificate Downloads' },
    { value: 'DISBURSEMENT', label: 'Loan Disbursement Status' },
    { value: 'OTHER', label: 'General / Other Support' },
  ];

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    const data = await ticketStore.getTickets(false);
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id || data[0].ticketId);
      ticketStore.markAsRead(data[0].id || data[0].ticketId);
    }
    setIsLoading(false);
  };

  const handleSelectTicket = (tId) => {
    setSelectedTicketId(tId);
    ticketStore.markAsRead(tId);
    setTickets(ticketStore.getLocalTickets());
  };

  const handleFormInputChange = (e) => {
    const { id, value } = e.target;
    setTicketForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!ticketForm.subject.trim()) newErrors.subject = 'Subject is required';
    if (!ticketForm.category) newErrors.category = 'Please select a query category';
    if (!ticketForm.description.trim()) newErrors.description = 'Please write a detailed description';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    const newTicket = await ticketStore.createTicket({
      category: categories.find((c) => c.value === ticketForm.category)?.label || ticketForm.category,
      subject: ticketForm.subject,
      description: ticketForm.description,
      borrowerName: 'Rahul Sharma',
    });

    const refreshed = await ticketStore.getTickets(false);
    setTickets(refreshed);

    if (newTicket) {
      const createdId = newTicket.id || newTicket.ticketId;
      setSelectedTicketId(createdId);
    }

    setTicketForm({ category: 'ACCOUNTS', subject: '', description: '' });
    setSuccessMessage('Your support ticket has been submitted! Our Loan Officer will review and reply shortly.');
    setActiveTab('Chat');
    setIsLoading(false);
  };

  const handleSendReply = async (e) => {
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

  const currentTicket =
    tickets.find((t) => (t.id || t.ticketId) === selectedTicketId) || tickets[0];
  const isOfficerReplied =
    currentTicket && (currentTicket.status === 'OFFICER_REPLIED' || currentTicket.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-7 w-7 text-blue-500" />
            Help & Support Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect directly with your assigned Loan Officer and manage help desk queries.
          </p>
        </div>

        {/* Tab Switch Buttons */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('Chat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'Chat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Active Queries & Chat
          </button>
          <button
            onClick={() => setActiveTab('NewTicket')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'NewTicket'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Raise New Ticket
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Assigned Relationship Manager info card */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            RM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Vikram Sethi</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Online Officer
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Assigned Senior Underwriting Officer</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-xs border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase">Avg Response</span>
            <span className="text-white font-bold">&lt; 15 Mins</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase">Working Hours</span>
            <span className="text-white font-bold">9:00 AM - 7:00 PM</span>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: CHAT & TICKET DETAILS */}
      {activeTab === 'Chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tickets List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                Support Threads ({tickets.length})
              </h3>
              <button
                onClick={loadTickets}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Refresh Tickets"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active support queries found.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {tickets.map((t) => {
                  const tid = t.id || t.ticketId;
                  const isSelected = tid === selectedTicketId;
                  const hasUnread = t.unreadForBorrower;
                  return (
                    <button
                      key={tid}
                      onClick={() => handleSelectTicket(tid)}
                      className={`w-full text-left p-3 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      {hasUnread && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      )}
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-mono font-bold text-slate-500">{tid}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : t.status === 'OFFICER_REPLIED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {t.messages && t.messages.length > 0
                          ? t.messages[t.messages.length - 1].text
                          : t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Chat Window (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
            {currentTicket ? (
              <>
                {/* Selected Ticket Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {currentTicket.id || currentTicket.ticketId}
                      </span>
                      <span className="text-xs text-slate-400">· {currentTicket.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">{currentTicket.subject}</h3>
                  </div>

                  {currentTicket.status !== 'RESOLVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkResolved(currentTicket.id || currentTicket.ticketId)}
                      leftIcon={CheckCircle2}
                      className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>

                {/* Resolution Banner */}
                {isOfficerReplied && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-blue-300 font-medium">
                      Officer replied! Did this resolve your query?
                    </span>
                    <button
                      onClick={() => handleMarkResolved(currentTicket.id || currentTicket.ticketId)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
                    >
                      Yes, Resolve Ticket
                    </button>
                  </div>
                )}

                {/* Messages Thread Container */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  {/* Original Description */}
                  <div className="flex flex-col items-start space-y-1 max-w-[85%]">
                    <span className="text-[10px] text-slate-500 font-semibold">You (Original Description)</span>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed">
                      {currentTicket.description}
                    </div>
                  </div>

                  {/* Dynamic Messages */}
                  {currentTicket.messages &&
                    currentTicket.messages.map((m, idx) => {
                      const isBorrower = m.senderRole === 'BORROWER';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col space-y-1 max-w-[85%] ${
                            isBorrower ? 'ml-auto items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {isBorrower ? 'You' : m.senderName || 'Loan Officer'}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isBorrower
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                                : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                          {m.timestamp && (
                            <span className="text-[9px] text-slate-600">{m.timestamp}</span>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Reply Input Box */}
                {currentTicket.status !== 'RESOLVED' ? (
                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply to the Loan Officer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      leftIcon={Send}
                      isLoading={isLoading}
                    >
                      Send Reply
                    </Button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    This support ticket has been resolved and closed.
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select a ticket thread or raise a new ticket to get help.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RAISE NEW TICKET FORM */}
      {activeTab === 'NewTicket' && (
        <div className="max-w-2xl bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            Raise Support Ticket
          </h2>

          <form onSubmit={handleCreateTicketSubmit} className="space-y-4" noValidate>
            <Input
              label="Ticket Subject"
              id="subject"
              placeholder="Brief description of your query or issue"
              value={ticketForm.subject}
              onChange={handleFormInputChange}
              error={errors.subject}
              disabled={isLoading}
            />

            <Select
              label="Query Category"
              id="category"
              options={categories}
              value={ticketForm.category}
              onChange={handleFormInputChange}
              error={errors.category}
              disabled={isLoading}
            />

            <TextArea
              label="Detailed Description"
              id="description"
              placeholder="Provide relevant loan account IDs, transaction dates, or specific questions..."
              value={ticketForm.description}
              onChange={handleFormInputChange}
              error={errors.description}
              rows={4}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              leftIcon={Send}
              isLoading={isLoading}
            >
              Submit Ticket to Loan Officer
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
