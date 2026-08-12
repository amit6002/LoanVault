import { useState } from 'react';
import { ShieldAlert, Mail, Phone, Eye, AlertTriangle, TrendingDown, DollarSign, Clock, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

/**
 * ============================================================
 * NPA COLLECTION MONITOR PAGE — PREMIUM EDITION
 * Risk-classified overdue accounts with severity badges,
 * exposure stats, and per-card action controls.
 * ============================================================
 */

const NPA_RISK_CONFIG = {
  'SMA-0': {
    label: 'SMA-0',
    sublabel: '1–30 days overdue',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    barClass: 'bg-amber-400',
    barWidth: '25%',
    severity: 1,
  },
  'SMA-1': {
    label: 'SMA-1',
    sublabel: '31–60 days overdue',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200',
    barClass: 'bg-orange-500',
    barWidth: '55%',
    severity: 2,
  },
  'SMA-2': {
    label: 'SMA-2',
    sublabel: '61–90 days overdue',
    badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200',
    barClass: 'bg-rose-500',
    barWidth: '80%',
    severity: 3,
  },
  'NPA': {
    label: 'NPA',
    sublabel: '90+ days overdue',
    badgeClass: 'bg-red-100 text-red-700 border border-red-300',
    barClass: 'bg-red-600',
    barWidth: '100%',
    severity: 4,
  },
};

const INITIAL_OVERDUES = [
  { id: 'LN-NPA-401', clientName: 'Dev Enterprises',   overdueDays: 78, outstanding: 1250000, status: 'SMA-2', phone: '+91 98765 43210', email: 'dev@example.com' },
  { id: 'LN-NPA-902', clientName: 'Rajesh Sharma',      overdueDays: 42, outstanding: 340000,  status: 'SMA-1', phone: '+91 87654 32109', email: 'rajesh@example.com' },
  { id: 'LN-NPA-214', clientName: 'Sunita Constructions', overdueDays: 97, outstanding: 2800000, status: 'NPA',   phone: '+91 76543 21098', email: 'sunita@example.com' },
  { id: 'LN-NPA-553', clientName: 'Arjun Mehta',        overdueDays: 18, outstanding: 120000,  status: 'SMA-0', phone: '+91 65432 10987', email: 'arjun@example.com' },
];

export default function NPAMonitorPage() {
  const [overdues, setOverdues] = useState(INITIAL_OVERDUES);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('ALL');

  const totalExposure   = overdues.reduce((s, o) => s + o.outstanding, 0);
  const npaCount        = overdues.filter(o => o.status === 'NPA').length;
  const sma2Count       = overdues.filter(o => o.status === 'SMA-2').length;
  const avgOverdueDays  = Math.round(overdues.reduce((s, o) => s + o.overdueDays, 0) / overdues.length);

  const handleNotify = (id, clientName) => {
    setNotifiedIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setNotifiedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);
  };

  const filtered = filterStatus === 'ALL'
    ? overdues
    : overdues.filter(o => o.status === filterStatus);

  const sortedFiltered = [...filtered].sort(
    (a, b) => (NPA_RISK_CONFIG[b.status]?.severity ?? 0) - (NPA_RISK_CONFIG[a.status]?.severity ?? 0)
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl border border-rose-200">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            </div>
            NPA Collector Queue
          </h1>
          <p className="text-sm text-slate-500 ml-16">
            Monitor high-risk overdue accounts and initiate settlement procedures.
          </p>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Exposure',
            value: formatCurrency(totalExposure, false),
            icon: DollarSign,
            iconClass: 'bg-rose-50 text-rose-600 border-rose-100',
            valueClass: 'text-rose-700',
          },
          {
            label: 'NPA Accounts',
            value: npaCount,
            icon: AlertTriangle,
            iconClass: 'bg-red-50 text-red-600 border-red-100',
            valueClass: 'text-red-700',
          },
          {
            label: 'SMA-2 Accounts',
            value: sma2Count,
            icon: TrendingDown,
            iconClass: 'bg-orange-50 text-orange-600 border-orange-100',
            valueClass: 'text-orange-700',
          },
          {
            label: 'Avg Overdue Days',
            value: `${avgOverdueDays}d`,
            icon: Clock,
            iconClass: 'bg-amber-50 text-amber-600 border-amber-100',
            valueClass: 'text-amber-700',
          },
        ].map(({ label, value, icon: Icon, iconClass, valueClass }) => (
          <div key={label} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-card flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-black mt-0.5 ${valueClass}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
        {['ALL', 'SMA-0', 'SMA-1', 'SMA-2', 'NPA'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-smooth-fast ${
              filterStatus === status
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* OVERDUE ACCOUNT CARDS */}
      <div className="space-y-4">
        {sortedFiltered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No accounts found for selected filter.</p>
          </div>
        )}

        {sortedFiltered.map((item) => {
          const risk    = NPA_RISK_CONFIG[item.status] || NPA_RISK_CONFIG['SMA-0'];
          const notified = notifiedIds.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden hover:shadow-card-md hover:border-indigo-200 transition-smooth-fast"
            >
              {/* Severity bar at top */}
              <div className="h-1 w-full bg-slate-100">
                <div className={`h-full ${risk.barClass} transition-smooth`} style={{ width: risk.barWidth }} />
              </div>

              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Left: Account info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {item.id}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-black ${risk.badgeClass}`}>
                      {risk.label} — {risk.sublabel}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.clientName}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-rose-400" />
                    <span className="text-rose-600 font-bold">{item.overdueDays} days overdue</span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>
                  </div>
                </div>

                {/* Right: Exposure + actions */}
                <div className="flex flex-col sm:items-end gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 block">
                      {formatCurrency(item.outstanding, false)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Default Exposure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notified ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                        ✅ Notice Sent
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNotify(item.id, item.clientName)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-200 transition-smooth-fast"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Issue Notice
                        </button>
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-smooth-fast"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </a>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-smooth-fast shadow-sm shadow-indigo-600/20">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
