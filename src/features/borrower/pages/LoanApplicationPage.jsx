import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, ArrowLeft, CheckCircle, FileText, UploadCloud, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PATHS, LIMITS, LOAN_TYPES, DOCUMENT_TYPE_LABELS } from '../../../utils/constants';
import { MOCK_LOAN_PRODUCTS } from '../../../data/mockLoans';
import { formatCurrency } from '../../../utils/formatters';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Checkbox from '../../../components/common/Checkbox';
import Button from '../../../components/common/Button';
import { api } from '../../../api/apiClient';

/**
 * ============================================================
 * LOAN APPLICATION PAGE (7-STEP WIZARD - LIGHT THEME)
 * Handles sequential multi-page form controls, calculates
 * real-time EMI summaries, enforces profile & bank linkage prerequisites.
 * ============================================================
 */
export default function LoanApplicationPage() {
  const [step, setStep] = useState(1);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isIncompletePrerequisite, setIsIncompletePrerequisite] = useState(false);
  const [formData, setFormData] = useState({
    productType: '',
    amount: 100000,
    tenureMonths: 12,
    purpose: '',
    name: '',
    dob: '',
    pan: '',
    aadhaar: '',
    income: 0,
    employer: '',
    existingEmi: 0,
    files: {},
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedProfile();
  }, []);

  const fetchSavedProfile = async () => {
    try {
      const profile = await api.get('/api/user/profile').catch(() => null);
      const savedBank = JSON.parse(localStorage.getItem('lms_user_bank_details') || '{}');

      const isProfileIncomplete = !profile || !profile.panNumber || !profile.aadhaarNumber || !profile.monthlyIncome || !profile.addressLine1;
      const isBankIncomplete = !savedBank || !savedBank.accountNumber || !savedBank.ifscCode;

      if (isProfileIncomplete || isBankIncomplete) {
        setIsIncompletePrerequisite(true);
      }

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.name || prev.name,
          dob: profile.dateOfBirth || prev.dob,
          pan: profile.panNumber || prev.pan,
          aadhaar: profile.aadhaarNumber || prev.aadhaar,
          income: profile.monthlyIncome ? parseFloat(profile.monthlyIncome) : prev.income,
          employer: profile.employerName || prev.employer,
          employmentType: profile.employmentType || 'SALARIED',
        }));
        setIsProfileLoaded(true);
      }
    } catch (err) {
      console.warn('Failed to pre-fill profile from Neon DB:', err);
    }
  };

  const handleProductSelect = (productType) => {
    const prod = MOCK_LOAN_PRODUCTS.find((p) => p.type === productType);
    setFormData((prev) => ({
      ...prev,
      productType,
      amount: prod ? prod.minAmount : LIMITS.MIN_LOAN_AMOUNT,
      tenureMonths: prod ? prod.minTenure : LIMITS.MIN_TENURE_MONTHS,
    }));
    setStep(2);
  };

  const selectedProduct = useMemo(() => {
    return MOCK_LOAN_PRODUCTS.find((p) => p.type === formData.productType) || null;
  }, [formData.productType]);

  const minAmount = selectedProduct?.minAmount || LIMITS.MIN_LOAN_AMOUNT;
  const maxAmount = selectedProduct?.maxAmount || LIMITS.MAX_LOAN_AMOUNT;
  const minTenure = selectedProduct?.minTenure || LIMITS.MIN_TENURE_MONTHS;
  const maxTenure = selectedProduct?.maxTenure || LIMITS.MAX_TENURE_MONTHS;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let typedValue = value;

    if (id === 'amount' || id === 'tenureMonths' || id === 'income' || id === 'existingEmi') {
      typedValue = parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: typedValue,
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleFileUpload = (docType, fileName) => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [docType]: fileName,
      },
    }));
    if (errors[docType]) {
      setErrors((prev) => ({ ...prev, [docType]: '' }));
    }
  };

  const handleRemoveFile = (docType) => {
    setFormData((prev) => {
      const updatedFiles = { ...prev.files };
      delete updatedFiles[docType];
      return {
        ...prev,
        files: updatedFiles,
      };
    });
  };

  const emiPreview = useMemo(() => {
    if (!selectedProduct || formData.amount <= 0 || formData.tenureMonths <= 0) return 0;
    const P = formData.amount;
    const r = selectedProduct.interestRate / 12 / 100;
    const N = formData.tenureMonths;
    return (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  }, [selectedProduct, formData.amount, formData.tenureMonths]);

  const handleNextStep = () => {
    const newErrors = {};

    if (step === 2) {
      if (formData.amount < minAmount || formData.amount > maxAmount) {
        newErrors.amount = `Amount must be between ${formatCurrency(minAmount, false)} and ${formatCurrency(maxAmount, false)}`;
      }
      if (formData.tenureMonths < minTenure || formData.tenureMonths > maxTenure) {
        newErrors.tenureMonths = `Tenure must be between ${minTenure} and ${maxTenure} months`;
      }
      if (!formData.purpose.trim()) newErrors.purpose = 'Please write the purpose of the loan';
    }

    if (step === 3) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.pan.trim()) {
        newErrors.pan = 'PAN card number is required';
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
        newErrors.pan = 'Please enter a valid PAN number format (e.g. ABCDE1234F)';
      }
      if (!formData.aadhaar.trim()) {
        newErrors.aadhaar = 'Aadhaar number is required';
      } else if (!/^\d{12}$/.test(formData.aadhaar)) {
        newErrors.aadhaar = 'Aadhaar must be exactly 12 numeric digits';
      }
    }

    if (step === 4) {
      if (formData.income <= 0) newErrors.income = 'Monthly income must be greater than 0';
      if (!formData.employer.trim()) newErrors.employer = 'Employer or business name is required';
    }

    if (step === 5) {
      selectedProduct.requiredDocs.forEach((docType) => {
        if (!formData.files[docType]) {
          newErrors[docType] = `${DOCUMENT_TYPE_LABELS[docType]} is required`;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmission = async () => {
    try {
      const payload = {
        loanType: formData.productType,
        loanAmount: formData.amount,
        tenureMonths: formData.tenureMonths,
        interestRate: selectedProduct?.interestRate || 10.5,
        fullName: formData.name,
        panNumber: formData.pan,
        employmentType: formData.employmentType,
        employerName: formData.employer,
        monthlyIncome: formData.income,
      };

      await api.post('/api/applications', payload);

      setStep(7);
    } catch (err) {
      alert(err.message || 'Failed to submit application to backend server.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 relative">
      {/* PREREQUISITE INTERCEPTION MODAL */}
      {isIncompletePrerequisite && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl text-center">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit mx-auto border border-amber-100">
              <AlertTriangle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Incomplete Profile & Linked Bank Account</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Before applying for a loan, you must complete your personal identity profile (PAN, Aadhaar, Income) and link a valid primary bank account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => navigate(PATHS.BORROWER_DASHBOARD)}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => navigate(PATHS.BORROWER_PROFILE)}
              >
                Complete Profile & Link Bank →
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 p-8 rounded-3xl relative shadow-xs">
        {/* Stepper Wizard Progress Indicators */}
        {step < 7 && (
          <div className="flex justify-between items-center border-b border-slate-200 pb-6 mb-8 text-xs font-semibold text-slate-400">
            {[
              'Product',
              'Terms',
              'Personal',
              'Income',
              'Documents',
              'Review',
            ].map((label, idx) => {
              const stepNum = idx + 1;
              const isCompleted = step > stepNum;
              const isActive = step === stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition-all ${
                      isCompleted
                        ? 'bg-indigo-600 text-white'
                        : isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </span>
                  <span className={`hidden sm:inline ${isActive ? 'text-slate-900 font-bold' : ''}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1: Select Loan Product Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Select Loan Product</h2>
              <p className="text-sm text-slate-500">Choose the credit class that fits your requirements.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_LOAN_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductSelect(prod.type)}
                  className="text-left p-6 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-indigo-500/50 transition-all group flex flex-col justify-between h-44 cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Interest Rate: {prod.interestRate}% P.A.</p>
                  </div>
                  <div className="flex justify-between items-center w-full mt-4 text-xs font-semibold text-slate-500">
                    <span>Limit: Up to {formatCurrency(prod.maxAmount, false)}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Configure <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Configure Terms */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">Loan Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <Input
                  label="Requested Loan Amount"
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  error={errors.amount}
                />
                <Input
                  label="Repayment Tenure (Months)"
                  id="tenureMonths"
                  type="number"
                  value={formData.tenureMonths}
                  onChange={handleInputChange}
                  error={errors.tenureMonths}
                />
                <Input
                  label="Purpose of Loan"
                  id="purpose"
                  type="text"
                  placeholder="Business expansion, home purchase..."
                  value={formData.purpose}
                  onChange={handleInputChange}
                  error={errors.purpose}
                />
              </div>
              
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-4 text-sm">
                <h3 className="font-bold text-slate-900">Estimated Repayments</h3>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Monthly EMI</span>
                  <span className="font-black text-emerald-600 text-lg">{formatCurrency(emiPreview)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Rate Applied</span>
                  <span className="font-bold text-slate-700">{selectedProduct?.interestRate}% P.A. (Fixed)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <Button variant="secondary" onClick={handlePrevStep} leftIcon={ArrowLeft}>Back</Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={ArrowRight}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Personal Information */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-xl font-extrabold text-slate-900">Personal Details</h2>
              {isProfileLoaded && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Pre-filled from Neon DB
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name (as in PAN)"
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
              <Input
                label="Date of Birth"
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                error={errors.dob}
              />
              <Input
                label="PAN Card Number"
                id="pan"
                type="text"
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={handleInputChange}
                error={errors.pan}
              />
              <Input
                label="12-Digit Aadhaar Number"
                id="aadhaar"
                type="text"
                placeholder="123456789012"
                value={formData.aadhaar}
                onChange={handleInputChange}
                error={errors.aadhaar}
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <Button variant="secondary" onClick={handlePrevStep} leftIcon={ArrowLeft}>Back</Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={ArrowRight}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 4: Employment & Financial */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">Employment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monthly Salaried Income"
                id="income"
                type="number"
                value={formData.income}
                onChange={handleInputChange}
                error={errors.income}
              />
              <Input
                label="Employer or Company Name"
                id="employer"
                type="text"
                value={formData.employer}
                onChange={handleInputChange}
                error={errors.employer}
              />
              <Input
                label="Existing EMI Obligations (Monthly)"
                id="existingEmi"
                type="number"
                value={formData.existingEmi}
                onChange={handleInputChange}
                error={errors.existingEmi}
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <Button variant="secondary" onClick={handlePrevStep} leftIcon={ArrowLeft}>Back</Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={ArrowRight}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 5: Document Upload */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">Verify Documents</h2>
            
            <div className="space-y-4">
              {selectedProduct?.requiredDocs.map((docType) => {
                const fileName = formData.files[docType];
                const fileError = errors[docType];
                return (
                  <div key={docType} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-900">{DOCUMENT_TYPE_LABELS[docType]}</span>
                      {fileName ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold"><CheckCircle className="h-4 w-4 text-emerald-600" /> Ready</span>
                      ) : (
                        <span className="text-amber-700 font-bold">Awaiting PDF</span>
                      )}
                    </div>

                    {fileName ? (
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                        <span className="text-slate-700 font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4 text-indigo-600" /> {fileName}</span>
                        <button type="button" onClick={() => handleRemoveFile(docType)} className="text-rose-600 hover:text-rose-700 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => handleFileUpload(docType, `${docType.toLowerCase()}_verification_doc.pdf`)}
                          className="w-full h-16 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 hover:border-indigo-500 transition-all text-xs gap-1 cursor-pointer bg-white"
                        >
                          <UploadCloud className="h-5 w-5 text-indigo-600" />
                          Click to simulate PDF attachment
                        </button>
                        {fileError && <p className="text-xs font-bold text-rose-600 mt-1.5">{fileError}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <Button variant="secondary" onClick={handlePrevStep} leftIcon={ArrowLeft}>Back</Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={ArrowRight}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 6: Final Review */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">Review & Submit</h2>
            
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl divide-y divide-slate-200 text-sm space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Loan Type</span>
                <span className="text-slate-900 font-bold">{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Requested Amount</span>
                <span className="text-slate-900 font-bold">{formatCurrency(formData.amount, false)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Monthly EMI Estimated</span>
                <span className="text-emerald-600 font-black">{formatCurrency(emiPreview)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Applicant Name</span>
                <span className="text-slate-900 font-semibold">{formData.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Files Attached</span>
                <span className="text-slate-900 font-semibold">{Object.keys(formData.files).length} Documents</span>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <Button variant="secondary" onClick={handlePrevStep} leftIcon={ArrowLeft}>Back</Button>
              <Button variant="primary" onClick={handleSubmission}>Submit Application</Button>
            </div>
          </div>
        )}

        {/* STEP 7: Success Node */}
        {step === 7 && (
          <div className="text-center space-y-6 py-8">
            <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
              <CheckCircle className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Application Received</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-medium">
                Your mortgage files have been saved successfully. Our credit underwriters will process document validations in 48 hours.
              </p>
            </div>
            <div className="pt-4 flex gap-4 justify-center">
              <Button variant="secondary" onClick={() => navigate(PATHS.BORROWER_DASHBOARD)}>Go to Dashboard</Button>
              <Button variant="primary" onClick={() => navigate(PATHS.BORROWER_APPLICATIONS)}>Track Application</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
