import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { PATHS, ROLES } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Checkbox from '../../../components/common/Checkbox';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * REGISTER PAGE COMPONENT
 * Connected to Spring Boot REST API for borrower account registration.
 * ============================================================
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const nameRef = useRef();
  const emailRef = useRef();

  const branchOptions = [
    { value: 'MUMBAI', label: 'Mumbai Main Branch' },
    { value: 'DELHI', label: 'Delhi Connaught Place Branch' },
    { value: 'BANGALORE', label: 'Bangalore Tech Park Branch' },
    { value: 'KOLKATA', label: 'Kolkata Salt Lake Branch' },
  ];

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.branch) newErrors.branch = 'Please select a preferred branch';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.name) {
        nameRef.current.focus();
      } else if (newErrors.email) {
        emailRef.current.focus();
      }
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // 1. Call Spring Boot Auth Register API
      const res = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        branch: formData.branch,
      });

      // 2. Save JWT Token & Session Data
      localStorage.setItem('lms_token', res.token);
      localStorage.setItem(
        'lms_session',
        JSON.stringify({
          userId: res.userId,
          name: res.name,
          email: res.email,
          role: res.role || ROLES.BORROWER,
          kycVerified: res.kycVerified,
          isAuthenticated: true,
        })
      );

      // 3. Redirect to Borrower Dashboard
      navigate(PATHS.BORROWER_DASHBOARD);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-900 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow effect inside form */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Headings */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-xl text-blue-500 mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Container */}
        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit} noValidate>
          <div className="space-y-4">
            {/* Name Input */}
            <Input
              ref={nameRef}
              label="Full Name"
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              leftIcon={User}
              disabled={isLoading}
            />

            {/* Email Input */}
            <Input
              ref={emailRef}
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              leftIcon={Mail}
              disabled={isLoading}
            />

            {/* Password Input */}
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              leftIcon={Lock}
              disabled={isLoading}
            />

            {/* Branch Selection Dropdown */}
            <Select
              label="Preferred Bank Branch"
              id="branch"
              options={branchOptions}
              value={formData.branch}
              onChange={handleInputChange}
              error={errors.branch}
              disabled={isLoading}
              placeholder="Select local branch office"
            />

            {/* Terms Agreement Checkbox */}
            <Checkbox
              label="I agree to the Terms & Conditions"
              description="I authorize LoanVault to verify my credit profile parameters."
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              error={errors.agreeToTerms}
              disabled={isLoading}
            />
          </div>

          {/* Submit Action Button */}
          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              isLoading={isLoading}
            >
              Register Account
            </Button>
            
            <p className="text-center text-sm text-slate-400">
              Or{' '}
              <Link to={PATHS.LOGIN} className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                sign in to your existing account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
