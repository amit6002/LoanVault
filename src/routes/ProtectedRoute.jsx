import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '../utils/constants';

/**
 * ============================================================
 * PROTECTED ROUTE GUARD COMPONENT
 * Restricts access to authenticated users. Checks localStorage
 * for an active session. Redirects to /login if unauthenticated.
 * ============================================================
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  
  // Retrieve session data from browser storage
  const sessionString = localStorage.getItem('lms_session');
  const session = sessionString ? JSON.parse(sessionString) : null;

  // 1. If not logged in, redirect to login page with original destination saved
  if (!session || !session.isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // 2. If role-based limits are set and user role doesn't match, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  // 3. Authenticated and authorized: render the nested child elements
  return <Outlet />;
}
