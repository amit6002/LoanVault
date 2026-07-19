import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Mail, KeyRound, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { PATHS, LIMITS } from '../../../utils/constants';
import { api } from '../../../api/apiClient';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * FORGOT PASSWORD PAGE COMPONENT
 * Connected to Spring Boot REST API for email OTP password recovery.
 * Step 1: Send OTP to email via Gmail SMTP
 * Step 2: Verify OTP
 * Step 3: Reset password in PostgreSQL database
 * ============================================================
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const inputRef = useRef();

  const handleInputChange = (e, fieldType) => {
    const { value, id } = e.target;
    if (apiError) setApiError('');
    if (apiSuccess) setApiSuccess('');

    if (fieldType === 'password') {
      setPasswords((prev) => ({ ...prev, [id]: value }));
      if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
    } else if (fieldType === 'email') {
      setEmail(value);
      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    } else if (fieldType === 'otp') {
      setOtp(value.replace(/\D/g, '').slice(0, LIMITS.OTP_LENGTH));
      if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
    }
  };

  // --- Step 1: Request Email OTP ---
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Email address is required' });
      inputRef.current.focus();
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      inputRef.current.focus();
      return;
    }

    setIsLoading(true);
    setApiError('');
    setApiSuccess('');

    try {
      // 1. Call Spring Boot API to send real email OTP
      const res = await api.post('/api/auth/forgot-password', { email });
      setApiSuccess(res.message || `OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setApiError(err.message || 'Failed to send OTP email.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (otp.length < LIMITS.OTP_LENGTH) {
      setErrors({ otp: `Please enter the complete ${LIMITS.OTP_LENGTH}-digit code` });
      inputRef.current.focus();
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // 2. Call Spring Boot API to verify OTP
      await api.post(`/api/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      setStep(3);
    } catch (err) {
      setApiError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleSubmitReset = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < LIMITS.MIN_PASSWORD_LENGTH) {
      newErrors.newPassword = `Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters long`;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // 3. Call Spring Boot API to update password in PostgreSQL
      await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: passwords.newPassword,
      });

      setApiSuccess('Password reset successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 1500);
    } catch (err) {
      setApiError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900/40 border border-slate-900 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Headings */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-xl text-blue-500 mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-400">
            {step === 1 && 'Enter your registered email to receive an email OTP.'}
            {step === 2 && `Check your Gmail inbox for the OTP sent to ${email}`}
            {step === 3 && 'Choose a strong, secure new password.'}
          </p>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* API Success Banner */}
        {apiSuccess && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-medium">
            {apiSuccess}
          </div>
        )}

        {/* STEP 1: Enter Email Form */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitEmail} noValidate>
            <Input
              ref={inputRef}
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => handleInputChange(e, 'email')}
              error={errors.email}
              leftIcon={Mail}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between gap-4 pt-2">
              <Link
                to={PATHS.LOGIN}
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
              <Button
                type="submit"
                variant="primary"
                rightIcon={ArrowRight}
                isLoading={isLoading}
              >
                Send OTP Email
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP Form */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitOtp} noValidate>
            <div className="space-y-4">
              <Input
                ref={inputRef}
                label="Verification Code (OTP)"
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP code"
                value={otp}
                onChange={(e) => handleInputChange(e, 'otp')}
                error={errors.otp}
                leftIcon={KeyRound}
                disabled={isLoading}
              />
              <div className="p-3.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-slate-400">
                📩 An email with your 6-digit OTP code has been delivered to <strong className="text-white">{email}</strong>.
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Change Email
              </button>
              <Button
                type="submit"
                variant="primary"
                rightIcon={ArrowRight}
                isLoading={isLoading}
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password Form */}
        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitReset} noValidate>
            <div className="space-y-4">
              <Input
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) => handleInputChange(e, 'password')}
                error={errors.newPassword}
                leftIcon={Lock}
                disabled={isLoading}
              />
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(e) => handleInputChange(e, 'password')}
                error={errors.confirmPassword}
                leftIcon={Lock}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
