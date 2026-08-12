import { useState } from 'react';
import { Save, CheckCircle2, Sliders, ShieldCheck, Percent, Cpu, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

/**
 * ============================================================
 * ADMIN SYSTEM SETTINGS PAGE — PREMIUM EDITION
 * Grouped setting sections with styled inputs, toggle switches,
 * unit labels, and a banner save confirmation.
 * ============================================================
 */

const Section = ({ icon: Icon, title, description, children, accent = 'indigo' }) => {
  const accentMap = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber:  'bg-amber-50 border-amber-100 text-amber-600',
    rose:   'bg-rose-50 border-rose-100 text-rose-600',
  };
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
        <div className={`p-2.5 rounded-xl border ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

const NumberField = ({ label, id, value, onChange, unit, min, max, step = '0.01', hint }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative flex items-center">
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 pr-16 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-smooth-fast"
      />
      {unit && (
        <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
          {unit}
        </span>
      )}
    </div>
    {hint && <p className="text-[11px] text-slate-400 font-medium">{hint}</p>}
  </div>
);

const ToggleField = ({ label, id, checked, onChange, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange({ target: { id, type: 'checkbox', checked: !checked } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-smooth-fast focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 ${
        checked ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState({
    // Underwriting
    minCibil: 650,
    baseInterest: 8.4,
    maxLoanMultiplier: 60,
    minIncomeMonthly: 25000,
    // Fees
    processingFee: 1.0,
    rbiBufferRate: 0.25,
    prepaymentPenalty: 2.0,
    // Security / feature flags
    twoFactorEnforced: true,
    autoKycEnabled: false,
    bureauApiLive: true,
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSaved(false);
    setConfigs(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    setTimeout(() => {
      localStorage.setItem('lms_system_configs', JSON.stringify(configs));
      setIsSaving(false);
      setSaved(true);
    }, 900);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
              <Sliders className="h-6 w-6 text-slate-700" />
            </div>
            System Configuration
          </h1>
          <p className="text-sm text-slate-500 ml-16">
            Manage global underwriting thresholds, fee parameters, and platform feature flags.
          </p>
        </div>
      </div>

      {/* SAVE FEEDBACK BANNER */}
      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Configuration saved successfully</p>
            <p className="text-xs text-emerald-600 mt-0.5">All threshold parameters have been updated in the master database.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} noValidate className="space-y-6">

        {/* 1. UNDERWRITING PARAMETERS */}
        <Section icon={Percent} title="Underwriting Parameters" description="Core credit eligibility and loan sizing thresholds." accent="indigo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Minimum CIBIL Score"
              id="minCibil"
              value={configs.minCibil}
              onChange={handleChange}
              min={300} max={900} step="1"
              unit="pts"
              hint="Applications below this score are auto-rejected."
            />
            <NumberField
              label="Base Interest Rate"
              id="baseInterest"
              value={configs.baseInterest}
              onChange={handleChange}
              min={1} max={36} step="0.1"
              unit="% p.a."
              hint="Benchmark rate before risk-based add-ons."
            />
            <NumberField
              label="Max Loan Multiplier"
              id="maxLoanMultiplier"
              value={configs.maxLoanMultiplier}
              onChange={handleChange}
              min={10} max={120} step="1"
              unit="× income"
              hint="Maximum loan amount as months of income."
            />
            <NumberField
              label="Min Monthly Income"
              id="minIncomeMonthly"
              value={configs.minIncomeMonthly}
              onChange={handleChange}
              min={10000} step="1000"
              unit="₹"
              hint="Minimum declared monthly income to qualify."
            />
          </div>
        </Section>

        {/* 2. FEE PARAMETERS */}
        <Section icon={Sliders} title="Fee Parameters" description="Processing and penalty fee rates applied at origination." accent="amber">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <NumberField
              label="Processing Fee"
              id="processingFee"
              value={configs.processingFee}
              onChange={handleChange}
              min={0} max={5} step="0.1"
              unit="%"
              hint="Deducted from disbursed principal."
            />
            <NumberField
              label="RBI Buffer Rate"
              id="rbiBufferRate"
              value={configs.rbiBufferRate}
              onChange={handleChange}
              min={0} max={2} step="0.05"
              unit="% p.a."
              hint="Regulatory buffer above base rate."
            />
            <NumberField
              label="Prepayment Penalty"
              id="prepaymentPenalty"
              value={configs.prepaymentPenalty}
              onChange={handleChange}
              min={0} max={5} step="0.5"
              unit="%"
              hint="Applied to outstanding principal on early closure."
            />
          </div>
        </Section>

        {/* 3. PLATFORM FEATURE FLAGS */}
        <Section icon={Cpu} title="Platform Feature Flags" description="Toggle system-wide features and security controls." accent="emerald">
          <div className="space-y-1">
            <ToggleField
              label="Enforce Two-Factor Authentication"
              id="twoFactorEnforced"
              checked={configs.twoFactorEnforced}
              onChange={handleChange}
              description="Require OTP verification for all staff logins."
            />
            <ToggleField
              label="Automated KYC Verification"
              id="autoKycEnabled"
              checked={configs.autoKycEnabled}
              onChange={handleChange}
              description="Use third-party API for real-time Aadhaar/PAN validation."
            />
            <ToggleField
              label="Credit Bureau API (Live Mode)"
              id="bureauApiLive"
              checked={configs.bureauApiLive}
              onChange={handleChange}
              description="Pull live CIBIL scores. Disable to use sandbox data."
            />
          </div>
        </Section>

        {/* 4. DANGER ZONE */}
        <Section icon={AlertTriangle} title="Danger Zone" description="High-impact settings that affect platform availability." accent="rose">
          <ToggleField
            label="Maintenance Mode"
            id="maintenanceMode"
            checked={configs.maintenanceMode}
            onChange={handleChange}
            description="When enabled, all borrower-facing pages show a maintenance notice."
          />
          {configs.maintenanceMode && (
            <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-semibold">
                Maintenance mode is <span className="font-black">ON</span>. Borrowers cannot access the portal until this is disabled.
              </p>
            </div>
          )}
        </Section>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-indigo-600/30 transition-smooth-fast disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
