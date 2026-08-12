import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Award, ArrowRight, Sparkles, Percent, HelpCircle,
  FileCheck, ShieldCheck, ChevronDown, CheckCircle2, Zap, BarChart2, Clock,
} from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { MOCK_LOAN_PRODUCTS } from '../../../data/mockLoans';
import { formatCurrency } from '../../../utils/formatters';

/**
 * ============================================================
 * PREMIUM LANDING PAGE
 * Dark gradient hero, animated blobs, loan rate cards,
 * numbered process steps, trust section, FAQ accordion.
 * ============================================================
 */

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-smooth ${
        open ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
      >
        <span className={`text-sm font-bold ${open ? 'text-indigo-700' : 'text-slate-900'}`}>{q}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-indigo-600' : 'text-slate-400'
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 animate-slide-up">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const steps = [
  {
    num: '01',
    icon: BarChart2,
    title: 'Calculate EMI Estimates',
    desc: 'Use our interactive calculator to test principal amounts, tenures, and interest rates — no account needed.',
    actionLink: PATHS.EMI_CALCULATOR,
    actionText: 'Calculate Now',
    color: 'indigo',
  },
  {
    num: '02',
    icon: CheckCircle2,
    title: 'Register Digital Account',
    desc: 'Create your Borrower profile in under 2 minutes with secure multi-factor authentication.',
    actionLink: PATHS.REGISTER,
    actionText: 'Create Profile',
    color: 'emerald',
  },
  {
    num: '03',
    icon: FileCheck,
    title: 'Upload Documents',
    desc: 'Submit PDF files of PAN, income proofs, and bank statements directly from your browser portal.',
    color: 'amber',
  },
  {
    num: '04',
    icon: Zap,
    title: 'Fast-Track Underwriting',
    desc: 'Our Loan Officers verify documents and pull credit score metrics within 48 business hours.',
    color: 'purple',
  },
];

const faqs = [
  {
    q: 'Do I need to pay any upfront fees before sanction?',
    a: 'No. LoanVault does not charge upfront cash commissions. Processing fees (0.5% to 2.0%) are deducted directly from the disbursed principal.',
  },
  {
    q: 'What CIBIL credit score is required?',
    a: 'We process prime loans for scores above 750. For scores between 650 and 750, a co-applicant or collateral may be required.',
  },
  {
    q: 'Which documents are needed for digital uploads?',
    a: 'Typically: (1) Identity Proof — PAN Card, (2) Address Proof — Aadhaar / Utility Bill, (3) Income Proof — 3 months salary slips or ITR, (4) Last 6 months bank statement.',
  },
  {
    q: 'How long does the approval process take?',
    a: 'Document verification usually takes 24–48 business hours. Final approval or rejection is communicated within 72 hours of a complete application.',
  },
];

const trustPoints = [
  { icon: ShieldCheck, text: 'RBI Registered & Compliant' },
  { icon: Shield,      text: '256-bit AES Encryption'     },
  { icon: Award,       text: 'ISO 27001 Certified'         },
  { icon: Clock,       text: '48-hr Underwriting SLA'      },
];

const stepColorMap = {
  indigo: { dot: 'bg-indigo-600', icon: 'bg-indigo-100 text-indigo-600 border-indigo-200', num: 'text-indigo-100', link: 'text-indigo-600 hover:text-indigo-800' },
  emerald: { dot: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600 border-emerald-200', num: 'text-emerald-100', link: 'text-emerald-600 hover:text-emerald-800' },
  amber: { dot: 'bg-amber-500', icon: 'bg-amber-100 text-amber-600 border-amber-200', num: 'text-amber-100', link: 'text-amber-600 hover:text-amber-800' },
  purple: { dot: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600 border-purple-200', num: 'text-purple-100', link: 'text-purple-600 hover:text-purple-800' },
};

export default function LandingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">

      {/* ── 1. HERO SECTION — Dark Gradient ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 pt-24 pb-28 lg:pt-32 lg:pb-36">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-16 right-8 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/20 backdrop-blur-sm animate-slide-up">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              Paperless Lending Lifecycle Management
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight animate-slide-up">
              Enterprise Loan Management{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
                Made Transparent
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium animate-slide-up">
              Calculate EMIs, submit structured documents, and monitor underwriting statuses
              on a secure, fully-audited platform built for modern borrowers and bankers.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                to={PATHS.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/40 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-600/40 transition-smooth hover:-translate-y-0.5"
              >
                Apply for a Loan
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to={PATHS.EMI_CALCULATOR}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-white/90 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-smooth hover:-translate-y-0.5"
              >
                Open EMI Calculator
              </Link>
            </div>

            {/* Trust mini-badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in">
              {trustPoints.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LOAN RATES BOARD ── */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Current Interest Rates & Parameters
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Browse institutional credit products. Adjust parameters in our live calculator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(MOCK_LOAN_PRODUCTS || []).map((prod) => (
              <div
                key={prod.id}
                className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 shadow-card hover:shadow-card-md hover:border-indigo-200 hover:-translate-y-1 transition-smooth-fast cursor-default group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {prod.name}
                    </h3>
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                      <Percent className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-indigo-600">
                    {prod.interestRate}%{' '}
                    <span className="text-xs text-slate-400 font-bold">P.A.</span>
                  </p>
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Loan Limit</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(prod.maxAmount, false)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Processing Fee</span>
                    <span className="text-slate-900 font-semibold">{prod.processingFeePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Required Docs</span>
                    <span className="text-slate-900 font-semibold">{prod.requiredDocs?.length ?? 3} docs</span>
                  </div>
                </div>
                <Link
                  to={PATHS.REGISTER}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-smooth-fast"
                >
                  Apply Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS — Step Process ── */}
      <section className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              How It Works
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              From calculation to final bank disbursement — our workflow is fully audited.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const cm = stepColorMap[step.color];
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-card hover:shadow-card-md hover:-translate-y-1 transition-smooth-fast"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${cm.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-3xl font-black ${cm.num} opacity-30`}>{step.num}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  {step.actionLink && (
                    <Link
                      to={step.actionLink}
                      className={`inline-flex items-center gap-1 text-xs font-bold ${cm.link} transition-colors`}
                    >
                      {step.actionText} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {/* Step connector line (hidden on last) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/3 -right-3 w-6 h-px border-t-2 border-dashed border-slate-200 z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. TRUST & SECURITY ── */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Institutional-Grade Security & Compliance
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              LoanVault operates in strict alignment with central banking guidelines. All document
              uploads are AES-256 encrypted at rest, ensuring complete confidentiality of your
              personal and financial data.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {trustPoints.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <Icon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Code Terminal Aesthetic */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 font-mono text-sm shadow-card-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-500 text-xs ml-2">security-audit.log</span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { prefix: '[SSL]',       text: 'Handshake complete — TLS 1.3 established',    color: 'text-emerald-400' },
                { prefix: '[VAULT]',     text: 'Document encryption check — AES-256 active',  color: 'text-emerald-400' },
                { prefix: '[BUREAU]',    text: 'Credit API node online — latency 42ms',       color: 'text-indigo-400'  },
                { prefix: '[AUDIT]',     text: 'Immutable trail logger active',               color: 'text-emerald-400' },
                { prefix: '[RBI]',       text: 'Compliance check passed — all rules OK',      color: 'text-emerald-400' },
                { prefix: '[SESSION]',   text: 'Idle timeout enforced — 20 min limit',        color: 'text-amber-400'   },
              ].map(({ prefix, text, color }, i) => (
                <div key={i} className="flex gap-3">
                  <span className={`font-bold ${color} flex-shrink-0`}>{prefix}</span>
                  <span className="text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-indigo-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mt-2">Everything you need to know before applying.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} q={faq.q} a={faq.a} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4 font-medium">Ready to get started?</p>
            <Link
              to={PATHS.REGISTER}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg transition-smooth hover:-translate-y-0.5"
            >
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
