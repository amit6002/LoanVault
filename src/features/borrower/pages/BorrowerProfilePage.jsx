import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, CreditCard, Home, MapPin, Building, Briefcase, DollarSign, Save, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { EMPLOYMENT_TYPES } from '../../../utils/constants';

/**
 * ============================================================
 * BORROWER PROFILE PAGE COMPONENT
 * Allows users to view, edit, and save profile details directly
 * to Neon Cloud Database. Saved information is automatically
 * used to pre-fill loan application forms.
 * Shows a prominent heading if profile is incomplete.
 * ============================================================
 */
export default function BorrowerProfilePage() {
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

  const isIncomplete = !profile.panNumber || !profile.aadhaarNumber || !profile.addressLine1 || !profile.monthlyIncome;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Borrower Profile Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal identity, address, and income details stored securely in Neon Database.
        </p>
      </div>

      {/* INCOMPLETE PROFILE WARNING BANNER */}
      {isIncomplete && !isLoading && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-md font-bold text-amber-400">Profile Incomplete — Please Complete Your Information</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your profile is missing required details (PAN, Aadhaar, Address, or Income). Completing your profile ensures your next loan application form is automatically pre-filled!
              </p>
            </div>
          </div>
        </div>
      )}

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

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching profile details from Neon Database...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* SECTION 1: Personal Identification */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="h-5 w-5 text-blue-500" />
              Personal Identification & Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Input
                label="Full Name (as in PAN)"
                id="name"
                type="text"
                value={profile.name}
                onChange={handleInputChange}
                leftIcon={User}
                required
              />
              <Input
                label="Email Address"
                id="email"
                type="email"
                value={profile.email}
                disabled
                leftIcon={Mail}
              />
              <Input
                label="Mobile Phone Number"
                id="phone"
                type="text"
                placeholder="+91 9876543210"
                value={profile.phone}
                onChange={handleInputChange}
                leftIcon={Phone}
              />
              <Input
                label="Date of Birth"
                id="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={handleInputChange}
                leftIcon={Calendar}
              />
              <Input
                label="PAN Card Number"
                id="panNumber"
                type="text"
                placeholder="ABCDE1234F"
                value={profile.panNumber}
                onChange={handleInputChange}
                leftIcon={CreditCard}
              />
              <Input
                label="Aadhaar Card Number (12 Digits)"
                id="aadhaarNumber"
                type="text"
                placeholder="1234 5678 9012"
                value={profile.aadhaarNumber}
                onChange={handleInputChange}
                leftIcon={CreditCard}
              />
            </div>
          </div>

          {/* SECTION 2: Residence & Address Details */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Home className="h-5 w-5 text-purple-500" />
              Residential Address Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address / House No."
                  id="addressLine1"
                  type="text"
                  placeholder="123 Financial Tower, Park Street"
                  value={profile.addressLine1}
                  onChange={handleInputChange}
                  leftIcon={MapPin}
                />
              </div>
              <Input
                label="City"
                id="city"
                type="text"
                placeholder="Mumbai"
                value={profile.city}
                onChange={handleInputChange}
                leftIcon={Building}
              />
              <Input
                label="State"
                id="state"
                type="text"
                placeholder="Maharashtra"
                value={profile.state}
                onChange={handleInputChange}
              />
              <Input
                label="Pincode"
                id="pincode"
                type="text"
                placeholder="400001"
                value={profile.pincode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* SECTION 3: Employment & Income Parameters */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Employment & Income Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Select
                label="Employment Type"
                id="employmentType"
                options={employmentOptions}
                value={profile.employmentType}
                onChange={handleInputChange}
              />
              <Input
                label="Employer / Business Name"
                id="employerName"
                type="text"
                placeholder="Tech Solutions Pvt Ltd"
                value={profile.employerName}
                onChange={handleInputChange}
                leftIcon={Briefcase}
              />
              <Input
                label="Monthly Salaried Income (₹)"
                id="monthlyIncome"
                type="number"
                placeholder="95000"
                value={profile.monthlyIncome}
                onChange={handleInputChange}
                leftIcon={DollarSign}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={Save}
              isLoading={isSaving}
            >
              Save Profile to Database
            </Button>
          </div>

        </form>
      )}

    </div>
  );
}
