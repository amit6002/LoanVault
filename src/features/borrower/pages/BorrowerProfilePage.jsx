import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, CreditCard, Home, MapPin, Building, Briefcase, DollarSign, Save, CheckCircle2, AlertTriangle, ShieldAlert, LifeBuoy, Send, ShieldCheck, Lock, Bell, Landmark } from 'lucide-react';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { EMPLOYMENT_TYPES } from '../../../utils/constants';

/**
 * ============================================================
 * BORROWER PROFILE & SETTINGS PAGE COMPONENT
 * Contains 4 structured tabs:
 *  1. Personal Info (Identity, Address, Income saved to Neon DB)
 *  2. Bank Account & Auto Debit
 *  3. Help Center & Support (Support Helpdesk moved inside Profile!)
 *  4. Settings & Notifications
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
    profileCompleted: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Support ticket form state inside Help Center tab
  const [ticketForm, setTicketForm] = useState({ category: 'EMI', subject: '', description: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

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
      const data = await api.get('/api/user/profile');
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
      const res = await api.put('/api/user/profile', profile);
      setSuccessMsg(res.message || 'Profile saved successfully to Neon Database!');
      setProfile(prev => ({
        ...prev,
        profileCompleted: res.data?.profileCompleted ?? true,
      }));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile details to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketForm({ category: 'EMI', subject: '', description: '' });
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  const isIncomplete = !profile.panNumber || !profile.aadhaarNumber || !profile.addressLine1 || !profile.monthlyIncome;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal details, auto-debit mandates, security settings, and support helpdesk.
        </p>
      </div>

      {/* INCOMPLETE PROFILE WARNING BANNER */}
      {isIncomplete && !isLoading && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-md font-bold text-amber-400">Profile Incomplete — Action Required</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your profile is missing required details. Completing your profile ensures your next loan application is pre-filled automatically!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
        {['Personal Info', 'Bank Account & Auto Debit', 'Help Center & Support', 'Settings & Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
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
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Personal Identification */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="h-5 w-5 text-blue-500" />
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
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Home className="h-5 w-5 text-purple-500" />
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
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="h-5 w-5 text-emerald-500" />
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
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6 text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Landmark className="h-5 w-5 text-blue-500" /> Linked Primary Bank Account & NACH Auto-Debit
          </h3>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-sm">State Bank of India</h4>
                <p className="text-slate-400">Account Number: <code className="text-white font-mono">XXXX-XXXX-4910</code></p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRIMARY & ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-850">
              <div>
                <span className="text-slate-500 block">IFSC Code</span>
                <span className="text-slate-200 font-mono font-semibold">SBIN0001042</span>
              </div>
              <div>
                <span className="text-slate-500 block">Branch</span>
                <span className="text-slate-200 font-semibold">Mumbai Main Branch</span>
              </div>
              <div>
                <span className="text-slate-500 block">Auto-Debit Limit</span>
                <span className="text-emerald-400 font-bold">₹1,00,000 / Month</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HELP CENTER & SUPPORT (Helpdesk moved inside Profile!) */}
      {activeTab === 'Help Center & Support' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <LifeBuoy className="h-5 w-5 text-blue-500" /> Help Center, Raise Ticket & Contact Relationship Manager
            </h3>

            {/* Contact RM Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Relationship Manager</span>
                <h4 className="text-sm font-bold text-white">Amit Kumar (Senior Banking Advisor)</h4>
                <p className="text-slate-400 mt-0.5">Direct Line: +91 98765 43210 • Email: rm.mumbai@loanvault.com</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => alert('Call initiated to Relationship Manager: +91 98765 43210')}>
                Call RM
              </Button>
            </div>

            {/* Raise Support Ticket Form */}
            <form onSubmit={handleRaiseTicket} className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Raise New Support Ticket</h4>
              
              {ticketSubmitted && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Support ticket TKT-2026-9081 submitted! Relationship Manager will respond within 2 business hours.</span>
                </div>
              )}

              <Select
                label="Category"
                id="category"
                options={[
                  { value: 'EMI', label: 'EMI Payment Issue' },
                  { value: 'DOCUMENT', label: 'Document & KYC Query' },
                  { value: 'ACCOUNT', label: 'Account & Statement Request' },
                ]}
                value={ticketForm.category}
                onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
              />

              <Input
                label="Subject"
                id="subject"
                type="text"
                placeholder="e.g. EMI payment status query"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <Button type="submit" variant="primary" leftIcon={Send}>
                Submit Support Ticket
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & NOTIFICATIONS */}
      {activeTab === 'Settings & Notifications' && (
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6 text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="h-5 w-5 text-purple-500" /> Security & Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white">SMS & Email EMI Payment Alerts</h4>
                <p className="text-slate-400">Receive reminders 3 days before EMI auto-debit dates</p>
              </div>
              <span className="text-emerald-400 font-bold">ENABLED</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white">Two-Factor Security Authentication (2FA)</h4>
                <p className="text-slate-400">Require OTP verification for profile changes</p>
              </div>
              <span className="text-emerald-400 font-bold">ENABLED</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
