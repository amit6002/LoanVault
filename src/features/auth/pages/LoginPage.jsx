import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { PATHS, ROLES } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Checkbox from '../../../components/common/Checkbox';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOGIN PAGE COMPONENT (LIGHT THEME)
 * Connected to Spring Boot REST API for email/password authentication
 * and Google OAuth2 login flow.
 * Includes 1-Click Quick Demo Login triggers for HR / Interviewers.
 * ============================================================
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRef = useRef();

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

  const executeLogin = async (loginEmail, loginPassword) => {
    setIsLoading(true);
    setApiError('');

    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem('lms_token', res.token);
      localStorage.setItem(
        'lms_session',
        JSON.stringify({
          userId: res.userId,
          name: res.name,
          email: res.email,
          role: res.role,
          kycVerified: res.kycVerified,
          isAuthenticated: true,
        })
      );

      const rolePaths = {
        [ROLES.BORROWER]: PATHS.BORROWER_DASHBOARD,
        [ROLES.OFFICER]: PATHS.OFFICER_DASHBOARD,
        [ROLES.MANAGER]: PATHS.MANAGER_DASHBOARD,
        [ROLES.ADMIN]: PATHS.ADMIN_DASHBOARD,
      };

      navigate(rolePaths[res.role] || PATHS.BORROWER_DASHBOARD);
    } catch (err) {
      setApiError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.email) emailRef.current.focus();
      return;
    }

    executeLogin(formData.email, formData.password);
  };

  const handleQuickDemoLogin = (email, password) => {
    setFormData({ email, password, rememberMe: false });
    executeLogin(email, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/15 transition-all duration-300 relative overflow-hidden text-slate-900">
        {/* Headings */}
        <div className="text-center">
          <div className="inline-flex p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mb-4 shadow-xs">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Sign In to Account</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Access your LoanVault digital portal</p>
        </div>

        {/* Global API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{apiError}</span>
          </div>
        )}

        {/* HR / Interviewer 1-Click Quick Demo Login Box */}
        <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Demo Accounts (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('borrower@loanvault.com', 'Borrower@1234')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold transition-all duration-200 hover:-translate-y-0.5 text-left truncate cursor-pointer shadow-xs hover:shadow-md"
            >
              👤 Borrower
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('officer@loanvault.com', 'Officer@1234')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold transition-all duration-200 hover:-translate-y-0.5 text-left truncate cursor-pointer shadow-xs hover:shadow-md"
            >
              📋 Loan Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager@loanvault.com', 'Manager@1234')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold transition-all duration-200 hover:-translate-y-0.5 text-left truncate cursor-pointer shadow-xs hover:shadow-md"
            >
              👔 Loan Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@loanvault.com', 'Admin@1234')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold transition-all duration-200 hover:-translate-y-0.5 text-left truncate cursor-pointer shadow-xs hover:shadow-md"
            >
              ⚙️ System Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
          <div className="space-y-4">
            <Input
              ref={emailRef}
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@domain.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              leftIcon={Mail}
              disabled={isLoading}
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  to={PATHS.FORGOT_PASSWORD}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                leftIcon={Lock}
                disabled={isLoading}
              />
            </div>

            <Checkbox
              label="Remember this device"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              isLoading={isLoading}
            >
              Sign In to Account
            </Button>

            <p className="text-center text-xs text-slate-500 font-medium">
              Or{' '}
              <Link to={PATHS.REGISTER} className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                create a new borrower account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
