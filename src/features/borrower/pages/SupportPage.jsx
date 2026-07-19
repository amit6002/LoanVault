import { useState } from 'react';
import { LifeBuoy, CheckCircle, Send, PlusCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * SUPPORT & HELPDESK COMPONENT
 * Lets user raise customer service tickets, checks FAQ lists,
 * and tracks ticket resolution status.
 * ============================================================
 */
export default function SupportPage() {
  const [tickets, setTickets] = useState([
    { id: 'TCK-2941', subject: 'Request for Loan Prepayment', category: 'Accounts', status: 'OPEN', date: '15 Jul 2026' },
    { id: 'TCK-1120', subject: 'Tax Interest Certificate not loaded', category: 'Statements', status: 'RESOLVED', date: '02 Jul 2026' }
  ]);

  const [form, setForm] = useState({
    subject: '',
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { value: 'ACCOUNTS', label: 'Loan Accounts Queries' },
    { value: 'STATEMENTS', label: 'Statement / Document Downloads' },
    { value: 'PAYMENTS', label: 'EMI / Payment Failures' },
    { value: 'OTHER', label: 'Other Queries' }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    if (successMessage) setSuccessMessage('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.category) newErrors.category = 'Please select a query category';
    if (!form.description.trim()) newErrors.description = 'Please write a query description';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setTimeout(() => {
      setIsLoading(false);
      const newTicketObj = {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: form.subject,
        category: categories.find(c => c.value === form.category)?.label || 'General',
        status: 'OPEN',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      setTickets(prev => [newTicketObj, ...prev]);
      setForm({ subject: '', category: '', description: '' });
      setSuccessMessage(`Support ticket ${newTicketObj.id} created successfully! Our team will respond within 24 hours.`);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Support Helpdesk</h1>
        <p className="text-sm text-slate-400 mt-1">Submit help query tickets and find instant answers to loan questions.</p>
      </div>

      {/* Inline success banner */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT CONTAINER: Create Ticket Form (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            Raise Support Ticket
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            <Input
              label="Ticket Subject"
              id="subject"
              placeholder="Brief description of the issue"
              value={form.subject}
              onChange={handleInputChange}
              error={errors.subject}
              disabled={isLoading}
            />

            <Select
              label="Query Category"
              id="category"
              options={categories}
              value={form.category}
              onChange={handleInputChange}
              error={errors.category}
              disabled={isLoading}
              placeholder="Select topic category"
            />

            <TextArea
              label="Detailed Description"
              id="description"
              placeholder="Provide relevant account numbers or transaction details..."
              value={form.description}
              onChange={handleInputChange}
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
              Submit Help Ticket
            </Button>
          </form>
        </div>

        {/* RIGHT CONTAINER: Active Tickets List (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <LifeBuoy className="h-5 w-5 text-blue-500" />
            Active Help Tickets
          </h2>

          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono font-semibold text-slate-500">{t.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{t.subject}</h4>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Category: {t.category}</span>
                  <span>Submitted: {t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
