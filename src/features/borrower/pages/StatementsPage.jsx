import { useState } from 'react';
import { BarChart3, Download, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * STATEMENTS & REPORTS HUB PAGE COMPONENT (LIGHT THEME)
 * Dedicated statements hub for tax certificates, full loan account
 * statements, interest certificates, and payment summaries.
 * ============================================================
 */
export default function StatementsPage() {
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  const statementsList = [
    { id: 1, title: 'Annual Interest Certificate (ITR Tax Exemption 24b/80C)', desc: 'Official tax deduction certificate for home and education loans.', type: 'PDF' },
    { id: 2, title: 'Full Loan Account Statement', desc: 'Comprehensive transaction history of all principal and interest debits.', type: 'PDF / EXCEL' },
    { id: 3, title: 'Interest Certificate (Provisional FY 2026-27)', desc: 'Provisional interest calculation certificate for advance tax filing.', type: 'PDF' },
    { id: 4, title: 'EMI Payment Summary', desc: 'Summary breakdown of cleared installments and upcoming due dates.', type: 'PDF' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Statements & Tax Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Download official bank account statements, tax certificates, and repayment summaries.</p>
      </div>

      {/* 2. Financial Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200/80 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-slate-900">Select Financial Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
          >
            <option value="2026-2027">FY 2026 - 2027 (Current)</option>
            <option value="2025-2026">FY 2025 - 2026</option>
            <option value="2024-2025">FY 2024 - 2025</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">All reports generated with official digital seal</span>
      </div>

      {/* 3. Statements Cards Grid */}
      <div className="space-y-4">
        {statementsList.map((st) => (
          <div key={st.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500/50 transition-all shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl flex-shrink-0">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-bold text-slate-900">{st.title}</h3>
                <p className="text-xs text-slate-500 max-w-xl font-medium">{st.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {st.type}
              </span>
              <Button
                variant="primary"
                size="sm"
                leftIcon={Download}
                onClick={() => alert(`Downloading ${st.title} for ${selectedYear}`)}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
