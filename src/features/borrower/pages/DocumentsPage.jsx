import { useState } from 'react';
import { Folder, Upload, Download, FileText, CheckCircle2, Plus, ShieldCheck, HardDrive } from 'lucide-react';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * DOCUMENTS HUB PAGE COMPONENT (Borrower Portal)
 * Dedicated document repository for borrowers.
 * Categorized sections: Loan Agreements, Sanction Letters, KYC, Income Proofs, Receipts.
 * Actions: Upload new document or Download existing documents.
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Documents Repository</h1>
          <p className="text-sm text-slate-400 mt-1">Upload, download, and manage all your loan agreements, KYC, and income files.</p>
        </div>

        <label className="cursor-pointer">
          <input type="file" onChange={handleSimulateUpload} className="hidden" />
          <div className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
            <Upload className="h-4 w-4" /> Upload Document
          </div>
        </label>
      </div>

      {uploadMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* 2. Category Filters */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
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
            className={`pb-2 border-b-2 transition-all ${
              activeCategory === cat.id ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {doc.category}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Ref: {doc.ref} • {doc.size}</p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-850 text-xs">
              <span className="text-slate-500">Uploaded: {doc.date}</span>
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
