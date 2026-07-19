import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS, ROLES } from '../../../utils/constants';

/**
 * ============================================================
 * OAUTH2 CALLBACK HANDLER PAGE
 * Catches the redirect from Spring Boot after successful Google login.
 * Extracts the JWT token and user details from URL parameters,
 * stores them in localStorage, and navigates to the role dashboard.
 * ============================================================
 */
export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role') || ROLES.BORROWER;

    if (token) {
      // Save JWT token and session user info
      localStorage.setItem('lms_token', token);
      localStorage.setItem('lms_session', JSON.stringify({
        name,
        email,
        role,
        isAuthenticated: true,
      }));

      // Role-based dashboard redirect
      const rolePaths = {
        [ROLES.BORROWER]: PATHS.BORROWER_DASHBOARD,
        [ROLES.OFFICER]: PATHS.OFFICER_DASHBOARD,
        [ROLES.MANAGER]: PATHS.MANAGER_DASHBOARD,
        [ROLES.ADMIN]: PATHS.ADMIN_DASHBOARD,
      };

      navigate(rolePaths[role] || PATHS.BORROWER_DASHBOARD, { replace: true });
    } else {
      navigate(PATHS.LOGIN, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold">Authenticating with Google...</h2>
        <p className="text-xs text-slate-400">Finalizing your secure session ticket.</p>
      </div>
    </div>
  );
}
