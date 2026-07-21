import { useState, useEffect } from 'react';
import { 
  LifeBuoy, Send, PlusCircle, HelpCircle, CheckCircle2, MessageSquare, 
  Clock, ShieldCheck, User, RefreshCw, AlertCircle, X 
} from 'lucide-react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import { ticketStore } from '../../../utils/ticketStore';

/**
 * ============================================================
 * HELP & SUPPORT CENTER COMPONENT (LIGHT THEME)
 * Displays Support Threads as cards. Clicking any thread opens 
 * a centered Pop-Up Modal Window for live chat & ticket management.
 * ============================================================
 */
export default function SupportPage() {
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const borrowerName = session.name || 'Rahul Sharma';

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

  // Lock background page scroll when pop-up modal is active
  useEffect(() => {
    if (selectedTicketId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedTicketId]);

  const loadTickets = async () => {
    setIsLoading(true);
    const data = await ticketStore.getTickets(false);
    setTickets(data);
    setIsLoading(false);
  };

  const handleOpenTicketModal = (tId) => {
    setSelectedTicketId(tId);
    ticketStore.markAsRead(tId);
    setTickets(ticketStore.getLocalTickets());
  };

  const handleCloseModal = () => {
    setSelectedTicketId(null);
    setReplyText('');
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
      borrowerName: borrowerName,
    });

    const refreshed = ticketStore.getLocalTickets();
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
      senderName: borrowerName,
    });

    const refreshed = ticketStore.getLocalTickets();
    setTickets(refreshed);
    setReplyText('');
    setIsLoading(false);
  };

  const handleMarkResolved = async (tId) => {
    setIsLoading(true);
    await ticketStore.updateStatus(tId, 'RESOLVED');
    const refreshed = ticketStore.getLocalTickets();
    setTickets(refreshed);
    setIsLoading(false);
  };

  const currentTicket = selectedTicketId
    ? tickets.find(
        (t) =>
          t.id === selectedTicketId ||
          t.ticketId === selectedTicketId ||
          String(t.id) === String(selectedTicketId) ||
          String(t.ticketId) === String(selectedTicketId)
      )
    : null;

  const isOfficerReplied =
    currentTicket && (currentTicket.status === 'OFFICER_REPLIED' || currentTicket.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-7 w-7 text-indigo-600" />
            Help & Support Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect directly with your assigned Loan Officer and manage support queries.
          </p>
        </div>

        {/* Tab Switch Buttons */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('Chat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'Chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Support Queries
          </button>
          <button
            onClick={() => setActiveTab('NewTicket')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'NewTicket'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Raise New Ticket
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Assigned Relationship Manager Info Card */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            PV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Pooja Verma (Loan Officer)</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                Online Officer
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Assigned Senior Underwriting Officer</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-500 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-6">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Avg Response</span>
            <span className="text-slate-900 font-bold">&lt; 15 Mins</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Working Hours</span>
            <span className="text-slate-900 font-bold">9:00 AM - 7:00 PM</span>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: SUPPORT THREADS GRID */}
      {activeTab === 'Chat' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Support Threads ({tickets.length})
            </h3>
            <button
              onClick={loadTickets}
              className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Tickets"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Threads
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/80 rounded-2xl text-center space-y-3 shadow-xs">
              <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-md font-bold text-slate-900">No Support Queries Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Raise a new ticket if you have any queries regarding your loan disbursement, EMI payments, or documents.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tickets.map((t) => {
                const tid = t.id || t.ticketId;
                const hasUnread = t.unreadForBorrower;
                const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1].text : t.description;

                return (
                  <div
                    key={tid}
                    onClick={() => handleOpenTicketModal(tid)}
                    className="p-5 bg-white border border-slate-200/80 hover:border-indigo-500/50 rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-md space-y-3 relative group flex flex-col justify-between"
                  >
                    {hasUnread && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-indigo-600">
                          {tid} · {t.category || 'EMI'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'OFFICER_REPLIED'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {t.subject}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {lastMsg}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>Click to open thread</span>
                      <span className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">View Query →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RAISE NEW TICKET FORM */}
      {activeTab === 'NewTicket' && (
        <div className="max-w-2xl bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
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

      {/* ============================================================ */}
      {/* 2. POP-UP MODAL OVERLAY FOR SELECTED SUPPORT QUERY THREAD    */}
      {/* ============================================================ */}
      {currentTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 no-scrollbar">
            {/* Top Close Button (X) */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 pr-8 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {currentTicket.id || currentTicket.ticketId}
                </span>
                <span className="text-xs text-slate-400">· {currentTicket.category || 'EMI'}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-auto ${
                    currentTicket.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : currentTicket.status === 'OFFICER_REPLIED'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentTicket.status}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentTicket.subject}
              </h2>
            </div>

            {/* Resolution Banner */}
            {isOfficerReplied && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-semibold">
                  Officer replied! Did this resolve your query?
                </span>
                <button
                  onClick={() => handleMarkResolved(currentTicket.id || currentTicket.ticketId)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
                >
                  Yes, Resolve Ticket
                </button>
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              {/* Original Description */}
              <div className="flex flex-col items-start space-y-1 max-w-[88%]">
                <span className="text-[10px] text-slate-400 font-bold uppercase">You (Original Description)</span>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-800 leading-relaxed shadow-2xs">
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
                      className={`flex flex-col space-y-1 max-w-[88%] ${
                        isBorrower ? 'ml-auto items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {isBorrower ? 'You' : m.senderName || 'Loan Officer'}
                      </span>
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          isBorrower
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      {m.timestamp && (
                        <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Reply Input Box / Closed Message */}
            {currentTicket.status !== 'RESOLVED' ? (
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply to the Loan Officer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors shadow-xs"
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
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                This support ticket has been resolved and closed.
              </div>
            )}

            {/* Footer Actions */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
              {currentTicket.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => handleMarkResolved(currentTicket.id || currentTicket.ticketId)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Mark as Resolved
                </button>
              )}
              <div className="ml-auto">
                <Button variant="secondary" size="md" onClick={handleCloseModal}>
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
