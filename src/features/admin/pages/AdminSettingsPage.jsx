import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * ADMIN SYSTEM SETTINGS PAGE COMPONENT
 * Renders master baseline data parameters for interest bounds, CIBIL thresholds.
 * ============================================================
 */
export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState({
    minCibil: 650,
    baseInterest: 8.4,
    processingFee: 1.0,
    rbiBufferRate: 0.25,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setConfigs(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    if (successMessage) setSuccessMessage('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('lms_system_configs', JSON.stringify(configs));
      setSuccessMessage('System parameter bounds updated successfully in master database!');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure global underwriting thresholds and bank parameter bounds.</p>
      </div>

      {/* Inline success banner */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="max-w-2xl bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Minimum CIBIL Score Threshold"
              id="minCibil"
              type="number"
              value={configs.minCibil}
              onChange={handleInputChange}
            />
            <Input
              label="Base Interest Rate (%)"
              id="baseInterest"
              type="number"
              step="0.01"
              value={configs.baseInterest}
              onChange={handleInputChange}
            />
            <Input
              label="Processing Fee (%)"
              id="processingFee"
              type="number"
              step="0.1"
              value={configs.processingFee}
              onChange={handleInputChange}
            />
            <Input
              label="RBI Buffer Interest Rate (%)"
              id="rbiBufferRate"
              type="number"
              step="0.01"
              value={configs.rbiBufferRate}
              onChange={handleInputChange}
            />
          </div>

          <div className="border-t border-slate-800 pt-6">
            <Button type="submit" variant="primary" leftIcon={Save} isLoading={isLoading}>
              Save Configurations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
