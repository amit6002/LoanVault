import { useState, useEffect } from 'react';
import { X, LifeBuoy, Send, CheckCircle2, Phone, Mail, HelpCircle, ShieldCheck, MessageSquare, Clock, ArrowLeft, User } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { ticketStore } from '../../utils/ticketStore';

/**
 * ============================================================
 * HELP CENTER MODAL OVERLAY WITH REAL-TIME CHAT SYSTEM
 * Allows Borrower to raise queries, view ticket status, and chat
 * directly with the assigned Loan Officer.
 * ============================================================
 */
export default function HelpCenterModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('Chat'); // 'Chat', 'NewTicket', 'FAQs'
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // New ticket form
  const [ticketForm, setTicketForm] = useState({ category: 'EMI', subject: '', description: '' });
  const [ticketSubmittedMsg, setTicketSubmittedMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  const loadTickets = () => {
    const data = ticketStore.getTickets();
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id);
    }
  };

  if (!isOpen) return null;

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;

    const newTicket = ticketStore.createTicket({
      category: ticketForm.category,
      subject: ticketForm.subject,
      description: ticketForm.description,
      borrowerName: 'Rahul Sharma',
    });

    setTickets(ticketStore.getTickets());
    setSelectedTicketId(newTicket.id);
    setTicketForm({ category: 'EMI', subject: '', description: '' });
    setTicketSubmittedMsg('Query submitted! Your Loan Officer will reply shortly.');
    setActiveTab('Chat');
    setTimeout(() => setTicketSubmittedMsg(''), 5000);
  };

  const handleSendBorrowerReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    const updated = ticketStore.addReply(selectedTicketId, {
      text: replyText,
      sender: 'BORROWER',
      senderName: 'Rahul Sharma',
    });

    setTickets(updated);
    setReplyText('');
  };

  const currentTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 relative">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 block mb-1">
              SUPPORT & OFFICER CHAT HELPDESK
            </span>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-blue-500" />
              Help & Support Center
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assigned Relationship Manager Box */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Loan Officer</span>
            <h4 className="text-sm font-bold text-white">Amit Kumar (Senior Credit Advisor)</h4>
            <p className="text-slate-400 mt-0.5">Direct Line: +91 98765 43210 • Email: rm.mumbai@loanvault.com</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => alert('Call initiated to Loan Officer: +91 98765 43210')}>
            Call Officer
          </Button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab('Chat')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'Chat' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Query Chat & Messages ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('NewTicket')}
            className={`pb-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'NewTicket' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Send className="h-4 w-4" />
            Raise New Query
          </button>
        </div>

        {ticketSubmittedMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{ticketSubmittedMsg}</span>
          </div>
        )}

        {/* TAB 1: REAL-TIME CHAT THREAD WITH LOAN OFFICER */}
        {activeTab === 'Chat' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Tickets List (4 cols) */}
            <div className="md:col-span-4 space-y-3 max-h-80 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Your Raised Queries</span>
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                    selectedTicketId === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
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
                  <p className="text-[10px] text-slate-400">{t.createdAt}</p>
                </div>
              ))}
            </div>

            {/* Right Column: Chat Box Messages (8 cols) */}
            <div className="md:col-span-8 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col h-80">
              {currentTicket ? (
                <>
                  {/* Chat Box Header */}
                  <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-xs">{currentTicket.subject}</h4>
                      <span className="text-[10px] text-slate-500">Ticket ID: {currentTicket.id} • Category: {currentTicket.category}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentTicket.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {currentTicket.status}
                    </span>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    {currentTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.sender === 'BORROWER' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                          m.sender === 'BORROWER'
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

                  {/* Send Reply Input Bar */}
                  <form onSubmit={handleSendBorrowerReply} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message to Loan Officer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <Button type="submit" variant="primary" size="sm" leftIcon={Send}>
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="m-auto text-center text-slate-500 text-xs">
                  No query selected. Raise a new query to start chatting!
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: RAISE NEW QUERY FORM */}
        {activeTab === 'NewTicket' && (
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Raise New Support Query</h4>

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
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Query Message</label>
              <textarea
                rows={4}
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Type your detailed message to your Loan Officer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={Send}>
                Submit Query to Officer
              </Button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Help Center
          </Button>
        </div>

      </div>
    </div>
  );
}
