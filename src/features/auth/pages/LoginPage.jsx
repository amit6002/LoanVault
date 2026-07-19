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
 * LOGIN PAGE COMPONENT
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
      // 1. Call Spring Boot Auth REST API
      const res = await api.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      // 2. Save JWT Token & Session Data
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

      // 3. Role-Based Navigation
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

  // Quick 1-Click Demo Login Trigger
  const handleQuickDemoLogin = (email, password) => {
    setFormData({ email, password, rememberMe: false });
    executeLogin(email, password);
  };

  // Google Sign-In Redirect Action
  const handleGoogleLogin = () => {
    window.location.href = api.googleAuthUrl;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-900 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden">
        {/* Inside Glow Design */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Headings */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-xl text-blue-500 mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Sign In</h2>
        </div>

        {/* Global API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* HR / Interviewer 1-Click Quick Demo Login Box */}
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Demo Accounts (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('borrower@loanvault.com', 'Borrower@1234')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all text-left truncate"
            >
              👤 Borrower
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('officer@loanvault.com', 'Officer@1234')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all text-left truncate"
            >
              📋 Loan Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager@loanvault.com', 'Manager@1234')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all text-left truncate"
            >
              👔 Loan Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@loanvault.com', 'Admin@1234')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all text-left truncate"
            >
              ⚙️ System Admin
            </button>
          </div>
        </div>

        {/* Google OAuth2 Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all duration-200 shadow-sm"
          >
            {/* Google G Logo SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
          <div className="space-y-4">
            {/* Email Input */}
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

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold tracking-wide text-slate-300">
                  Password
                </label>
                <Link
                  to={PATHS.FORGOT_PASSWORD}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
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

            {/* Remember Me Option Checkbox */}
            <Checkbox
              label="Remember this device"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {/* Submit Action */}
          <div className="space-y-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              isLoading={isLoading}
            >
              Sign In to Account
            </Button>

            <p className="text-center text-sm text-slate-400">
              Or{' '}
              <Link to={PATHS.REGISTER} className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                create a new borrower account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
