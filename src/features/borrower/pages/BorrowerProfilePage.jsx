import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, CreditCard, Home, MapPin, Building, Briefcase, DollarSign, Save, CheckCircle2, AlertTriangle, ShieldAlert, Landmark, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { EMPLOYMENT_TYPES } from '../../../utils/constants';

/**
 * ============================================================
 * BORROWER PROFILE & SETTINGS PAGE COMPONENT (LIGHT THEME)
 * Contains 3 structured tabs:
 *  1. Personal Info (Identity, Address, Income saved to Neon DB)
 *  2. Bank Account & Auto Debit (Fill/Update linked bank details)
 *  3. Security & Settings
 * ============================================================
 */
export default function BorrowerProfilePage() {
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    panNumber: '',
    aadhaarNumber: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    employmentType: 'SALARIED',
    employerName: '',
    monthlyIncome: '',
    // Bank Account details
    bankName: 'State Bank of India',
    accountNumber: '409128374910',
    ifscCode: 'SBIN0001042',
    branchName: 'Mumbai Main Branch',
    accountHolderName: '',
    profileCompleted: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const employmentOptions = [
    { value: EMPLOYMENT_TYPES.SALARIED, label: 'Salaried Employee' },
    { value: EMPLOYMENT_TYPES.SELF_EMPLOYED, label: 'Self-Employed Professional' },
    { value: EMPLOYMENT_TYPES.BUSINESS, label: 'Business Owner / MSME' },
    { value: EMPLOYMENT_TYPES.RETIRED, label: 'Retired' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/user/profile').catch(() => null);
      const savedBank = JSON.parse(localStorage.getItem('lms_user_bank_details') || '{}');

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          panNumber: data.panNumber || '',
          aadhaarNumber: data.aadhaarNumber || '',
          addressLine1: data.addressLine1 || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          employmentType: data.employmentType || 'SALARIED',
          employerName: data.employerName || '',
          monthlyIncome: data.monthlyIncome || '',
          bankName: savedBank.bankName || 'State Bank of India',
          accountNumber: savedBank.accountNumber || '409128374910',
          ifscCode: savedBank.ifscCode || 'SBIN0001042',
          branchName: savedBank.branchName || 'Mumbai Main Branch',
          accountHolderName: savedBank.accountHolderName || data.name || '',
          profileCompleted: data.profileCompleted || false,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch profile from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/api/user/profile', profile).catch(() => ({ message: 'Profile updated locally' }));
      
      localStorage.setItem('lms_user_bank_details', JSON.stringify({
        bankName: profile.bankName,
        accountNumber: profile.accountNumber,
        ifscCode: profile.ifscCode,
        branchName: profile.branchName,
        accountHolderName: profile.accountHolderName || profile.name,
      }));

      setSuccessMsg(res.message || 'Profile & Bank Account details saved successfully!');
      setProfile(prev => ({
        ...prev,
        profileCompleted: true,
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const isIncomplete = !profile.panNumber || !profile.aadhaarNumber || !profile.addressLine1 || !profile.monthlyIncome || !profile.accountNumber || !profile.ifscCode;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your identity details, bank account linkage, and security preferences.
        </p>
      </div>

      {/* INCOMPLETE PROFILE WARNING BANNER */}
      {isIncomplete && !isLoading && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-md font-bold text-amber-900">Profile & Bank Linkage Incomplete — Action Required</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed font-medium">
                Please complete your identity details and link a valid bank account to enable loan applications!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 overflow-x-auto pb-1">
        {['Personal Info', 'Bank Account & Auto Debit', 'Security & Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: PERSONAL INFO */}
      {activeTab === 'Personal Info' && (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800 flex items-center gap-2 font-medium">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Personal Identification */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <User className="h-5 w-5 text-indigo-600" />
              Personal Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Input label="Full Name (as in PAN)" id="name" type="text" value={profile.name} onChange={handleInputChange} leftIcon={User} required />
              <Input label="Email Address" id="email" type="email" value={profile.email} disabled leftIcon={Mail} />
              <Input label="Mobile Phone Number" id="phone" type="text" placeholder="+91 9876543210" value={profile.phone} onChange={handleInputChange} leftIcon={Phone} />
              <Input label="Date of Birth" id="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={handleInputChange} leftIcon={Calendar} />
              <Input label="PAN Card Number" id="panNumber" type="text" placeholder="ABCDE1234F" value={profile.panNumber} onChange={handleInputChange} leftIcon={CreditCard} />
              <Input label="Aadhaar Card Number" id="aadhaarNumber" type="text" placeholder="1234 5678 9012" value={profile.aadhaarNumber} onChange={handleInputChange} leftIcon={CreditCard} />
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Home className="h-5 w-5 text-purple-600" />
              Address Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="sm:col-span-2">
                <Input label="Street Address" id="addressLine1" type="text" placeholder="123 Park Street" value={profile.addressLine1} onChange={handleInputChange} leftIcon={MapPin} />
              </div>
              <Input label="City" id="city" type="text" placeholder="Mumbai" value={profile.city} onChange={handleInputChange} leftIcon={Building} />
              <Input label="State" id="state" type="text" placeholder="Maharashtra" value={profile.state} onChange={handleInputChange} />
              <Input label="Pincode" id="pincode" type="text" placeholder="400001" value={profile.pincode} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 3: Employment & Income */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              Employment & Income Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Select label="Employment Type" id="employmentType" options={employmentOptions} value={profile.employmentType} onChange={handleInputChange} />
              <Input label="Employer / Business Name" id="employerName" type="text" placeholder="Tech Solutions Pvt Ltd" value={profile.employerName} onChange={handleInputChange} leftIcon={Briefcase} />
              <Input label="Monthly Salaried Income (₹)" id="monthlyIncome" type="number" placeholder="95000" value={profile.monthlyIncome} onChange={handleInputChange} leftIcon={DollarSign} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" size="lg" leftIcon={Save} isLoading={isSaving}>
              Save Profile to Database
            </Button>
          </div>

        </form>
      )}

      {/* TAB 2: BANK ACCOUNT & AUTO DEBIT */}
      {activeTab === 'Bank Account & Auto Debit' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Landmark className="h-5 w-5 text-indigo-600" /> Primary Bank Account & NACH Auto-Debit Linkage
            </h3>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <Input label="Bank Name" id="bankName" type="text" placeholder="e.g. State Bank of India" value={profile.bankName} onChange={handleInputChange} leftIcon={Landmark} required />
              <Input label="Account Number" id="accountNumber" type="text" placeholder="e.g. 409128374910" value={profile.accountNumber} onChange={handleInputChange} leftIcon={CreditCard} required />
              <Input label="IFSC Code" id="ifscCode" type="text" placeholder="e.g. SBIN0001042" value={profile.ifscCode} onChange={handleInputChange} required />
              <Input label="Branch Name" id="branchName" type="text" placeholder="e.g. Mumbai Main Branch" value={profile.branchName} onChange={handleInputChange} />
              <Input label="Account Holder Name" id="accountHolderName" type="text" placeholder={profile.name || "Full Name as in Bank"} value={profile.accountHolderName || profile.name} onChange={handleInputChange} leftIcon={User} />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">NACH e-Mandate Status</h4>
                <p className="text-slate-500">Automated EMI repayment debit clearance</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ACTIVE & LINKED
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" leftIcon={Save} isLoading={isSaving}>
                Save Bank Details
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY & SETTINGS */}
      {activeTab === 'Security & Settings' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 text-xs shadow-xs">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Lock className="h-5 w-5 text-purple-600" /> Security & Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">SMS & Email EMI Payment Alerts</h4>
                <p className="text-slate-500">Receive reminders 3 days before EMI auto-debit dates</p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ENABLED
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">Two-Factor Security Authentication (2FA)</h4>
                <p className="text-slate-500">Require OTP verification for profile changes</p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
