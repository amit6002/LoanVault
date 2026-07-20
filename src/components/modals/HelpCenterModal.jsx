import { useState } from 'react';
import { X, LifeBuoy, Send, CheckCircle2, Phone, Mail, HelpCircle, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

/**
 * ============================================================
 * HELP CENTER MODAL OVERLAY COMPONENT
 * Standalone Help & Support modal opened via "Visit Help Center →".
 * Contains Relationship Manager contact info, Support Ticket submission, and FAQs.
 * ============================================================
 */
export default function HelpCenterModal({ isOpen, onClose }) {
  const [ticketForm, setTicketForm] = useState({ category: 'EMI', subject: '', description: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketForm({ category: 'EMI', subject: '', description: '' });
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8 relative">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 block mb-1">
              SUPPORT HELPDESK
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
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Relationship Manager</span>
            <h4 className="text-sm font-bold text-white">Amit Kumar (Senior Banking Advisor)</h4>
            <p className="text-slate-400 mt-0.5">Direct Line: +91 98765 43210 • Email: rm.mumbai@loanvault.com</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => alert('Call initiated to Relationship Manager: +91 98765 43210')}>
            Call RM
          </Button>
        </div>

        {/* Raise Support Ticket Form */}
        <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Raise New Support Ticket</h4>
          
          {ticketSubmitted && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Support ticket TKT-2026-9081 submitted! Your Relationship Manager will respond within 2 business hours.</span>
            </div>
          )}

          <Select
            label="Category"
            id="category"
            options={[
              { value: 'EMI', label: 'EMI Payment Issue' },
              { value: 'DOCUMENT', label: 'Document & KYC Query' },
              { value: 'ACCOUNT', label: 'Account & Statement Request' },
            ]}
            value={ticketForm.category}
            onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
          />

          <Input
            label="Subject"
            id="subject"
            type="text"
            placeholder="e.g. EMI payment status query"
            value={ticketForm.subject}
            onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
            required
          />

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Description</label>
            <textarea
              rows={3}
              value={ticketForm.description}
              onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your query in detail..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" variant="primary" leftIcon={Send}>
              Submit Ticket
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
