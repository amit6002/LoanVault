import { Link } from 'react-router-dom';
import { Shield, Clock, Award, CheckCircle, ArrowRight, Sparkles, Cpu, Percent, HelpCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { MOCK_LOAN_PRODUCTS } from '../../../data/mockLoans';
import { formatCurrency } from '../../../utils/formatters';

/**
 * ============================================================
 * LANDING PAGE COMPONENT
 * The public marketing dashboard. Updated with interactive product tables,
 * process flow diagrams, and informational FAQ directories.
 * ============================================================
 */
export default function LandingPage() {
  const steps = [
    {
      num: '01',
      title: 'Calculate EMI Estimations',
      desc: 'Use our public slider tool to test principal amounts, tenures, and interest rates without creating an account.',
      actionLink: PATHS.EMI_CALCULATOR,
      actionText: 'Calculate Now'
    },
    {
      num: '02',
      title: 'Register Digital Account',
      desc: 'Create your Borrower profile in 2 minutes. Authenticate securely using multi-factor credentials.',
      actionLink: PATHS.REGISTER,
      actionText: 'Create Profile'
    },
    {
      num: '03',
      title: 'Attach Documents',
      desc: 'Submit PDF files of PAN, income proofs, and bank statements directly from your browser portal.',
    },
    {
      num: '04',
      title: 'Fast-Track Underwriting',
      desc: 'Our Loan Officers verify documents and pull automated credit score metrics within 48 business hours.',
    }
  ];

  const faqs = [
    {
      q: 'Do I need to pay any upfront fees before sanction?',
      a: 'No. LoanVault does not charge upfront cash commissions. Processing fees (ranging from 0.5% to 2.0%) are deducted directly from the disbursed principal amount.'
    },
    {
      q: 'What are the CIBIL credit score requirements?',
      a: 'We process prime loans for scores above 750. For scores between 650 and 750, co-applicant additions or collateral backing may be requested.'
    },
    {
      q: 'Which documents are required for digital uploads?',
      a: 'Usually, you need: 1. Identity Proof (PAN Card), 2. Address Proof (Aadhaar Card/Utility Bills), 3. Income Proof (3 months salary slips or ITR filings), 4. Last 6 months bank account statements.'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      
      {/* 1. HERO CONSOLE SECTION */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-28 border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Paperless Lending Lifecycle Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Loan Management{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Made Transparent
              </span>
            </h1>
            
            <p className="text-md sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Calculate EMIs, submit structured document files, and monitor underwriting statuses on a secure, audited platform built for modern borrowers and bankers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={PATHS.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Apply for Loan
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to={PATHS.EMI_CALCULATOR}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
              >
                Open EMI Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME LOAN RATES AND LIMITS BOARD */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Current Interest Rates & Parameters
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Browse institutional credit products and limits. Try adjusting parameter metrics in our calculator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_LOAN_PRODUCTS.map((prod) => (
              <div key={prod.id} className="p-6 rounded-xl border border-slate-900 bg-slate-900/30 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Percent className="h-4.5 w-4.5 text-blue-500" />
                    {prod.name}
                  </h3>
                  <p className="text-2xl font-black text-blue-400 mt-1">{prod.interestRate}% <span className="text-xs text-slate-500 font-medium">P.A.</span></p>
                </div>
                <div className="space-y-2 border-t border-slate-850 pt-3 text-xs leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Limit</span>
                    <span className="text-slate-300 font-semibold">{formatCurrency(prod.maxAmount, false)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing Fee</span>
                    <span className="text-slate-300 font-semibold">{prod.processingFeePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required Files</span>
                    <span className="text-slate-300 font-semibold">{prod.requiredDocs.length} Docs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP PROCESS FLOW GUIDE */}
      <section className="py-16 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How the System Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From calculation parameters to final bank disbursement, our workflow is fully-audited.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="relative space-y-3">
                <span className="text-4xl font-black text-blue-500/20 block">{s.num}</span>
                <h4 className="text-md font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                {s.actionLink && (
                  <Link to={s.actionLink} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold pt-1">
                    {s.actionText} <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRUST CREDENTIALS & SECURITY BOARD */}
      <section className="py-16 border-b border-slate-900 bg-slate-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Institutional Grade Security & Compliance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              LoanVault operates in strict alignment with central banking guidelines. All uploaded document files are encrypted in rest containers, ensuring co-applicant personal details are safeguarded.
            </p>
            <div className="flex gap-4 items-center pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="h-4.5 w-4.5" />
                RBI Registered Rules
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <FileCheck className="h-4.5 w-4.5" />
                256-bit Encryption
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 text-xs font-mono">
            <span className="text-blue-500 font-bold block">// Security compliance check logs</span>
            <div className="space-y-2 text-slate-400">
              <p>[SYSTEM] SSL Handshake initiated... Success</p>
              <p>[COMPLIANCE] Encrypted document vault check... All Clear</p>
              <p>[CREDIT CHECK] Secure bureau network API node online</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-500" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-850">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-5 space-y-2">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
