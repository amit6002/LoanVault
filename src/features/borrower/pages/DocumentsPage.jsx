import { useState } from 'react';
import { Folder, Upload, Download, FileText, CheckCircle2, Plus, ShieldCheck, HardDrive } from 'lucide-react';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * DOCUMENTS HUB PAGE COMPONENT (LIGHT THEME)
 * Dedicated document repository for borrowers.
 * ============================================================
 */
export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [uploadMsg, setUploadMsg] = useState('');

  const documentsList = [
    { id: 1, title: 'Loan Agreement & Terms', category: 'AGREEMENTS', size: '2.4 MB', date: '20 Jul 2026', ref: 'LN-APP-2026-05327' },
    { id: 2, title: 'Sanction Approval Letter', category: 'AGREEMENTS', size: '1.1 MB', date: '20 Jul 2026', ref: 'LN-APP-2026-05327' },
    { id: 3, title: 'PAN Card Copy', category: 'KYC', size: '850 KB', date: '15 Jul 2026', ref: 'KYC-PAN' },
    { id: 4, title: 'Aadhaar Card Front & Back', category: 'KYC', size: '1.4 MB', date: '15 Jul 2026', ref: 'KYC-AADHAAR' },
    { id: 5, title: 'Last 3 Months Salary Slips', category: 'INCOME', size: '3.2 MB', date: '15 Jul 2026', ref: 'INC-SLIP' },
    { id: 6, title: 'EMI Payment Receipt - July 2026', category: 'RECEIPTS', size: '420 KB', date: '05 Jul 2026', ref: 'RCP-7819' },
  ];

  const handleSimulateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadMsg(`Document "${file.name}" uploaded successfully to database!`);
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const filteredDocs = activeCategory === 'ALL'
    ? documentsList
    : documentsList.filter(d => d.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Upload Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Documents Repository</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, download, and manage all your loan agreements, KYC, and income files.</p>
        </div>

        <label className="cursor-pointer">
          <input type="file" onChange={handleSimulateUpload} className="hidden" />
          <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs">
            <Upload className="h-4 w-4" /> Upload Document
          </div>
        </label>
      </div>

      {uploadMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* 2. Category Filters */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Documents' },
          { id: 'AGREEMENTS', label: 'Agreements & Sanctions' },
          { id: 'KYC', label: 'KYC Files' },
          { id: 'INCOME', label: 'Income Proofs' },
          { id: 'RECEIPTS', label: 'Payment Receipts' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`pb-2 border-b-2 transition-all cursor-pointer ${
              activeCategory === cat.id ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 hover:border-indigo-500/50 transition-all shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  {doc.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Ref: {doc.ref} • {doc.size}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Uploaded: {doc.date}</span>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Download}
                onClick={() => alert(`Downloading ${doc.title}`)}
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
