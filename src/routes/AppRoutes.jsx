import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { PATHS } from '../utils/constants';

import PublicLayout from '../layouts/PublicLayout';
import LandingPage from '../features/landing/pages/LandingPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import EMICalculatorPage from '../features/emi-calculator/pages/EMICalculatorPage';
import OAuth2CallbackPage from '../features/auth/pages/OAuth2CallbackPage';

import ErrorBoundary from '../components/common/ErrorBoundary';

import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import BorrowerDashboard from '../features/borrower/pages/BorrowerDashboard';
import LoanApplicationPage from '../features/borrower/pages/LoanApplicationPage';
import MyApplicationsPage from '../features/borrower/pages/MyApplicationsPage';
import MyLoansPage from '../features/borrower/pages/MyLoansPage';
import EMICalendarPage from '../features/borrower/pages/EMICalendarPage';
import SupportPage from '../features/borrower/pages/SupportPage';
import BorrowerProfilePage from '../features/borrower/pages/BorrowerProfilePage';
import DocumentsPage from '../features/borrower/pages/DocumentsPage';
import StatementsPage from '../features/borrower/pages/StatementsPage';

import OfficerDashboard from '../features/officer/pages/OfficerDashboard';
import ApplicationQueuePage from '../features/officer/pages/ApplicationQueuePage';
import PerformanceTrackerPage from '../features/officer/pages/PerformanceTrackerPage';

import ManagerDashboard from '../features/manager/pages/ManagerDashboard';
import ApprovalQueuePage from '../features/manager/pages/ApprovalQueuePage';
import PortfolioReportsPage from '../features/manager/pages/PortfolioReportsPage';
import TeamManagementPage from '../features/manager/pages/TeamManagementPage';
import DisbursementsPage from '../features/manager/pages/DisbursementsPage';
import NPAMonitorPage from '../features/manager/pages/NPAMonitorPage';

import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ManageUsersPage from '../features/admin/pages/ManageUsersPage';
import AuditTrailPage from '../features/admin/pages/AuditTrailPage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';

/**
 * 404 Page Not Found Component
 */
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
    <h1 className="text-7xl font-extrabold text-blue-500 mb-4 animate-bounce">404</h1>
    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
    <p className="text-slate-400 mb-6">The page you are looking for does not exist or has been moved.</p>
    <Link to={PATHS.HOME} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-all">
      Return Home
    </Link>
  </div>
);

/**
 * ============================================================
 * ROUTER CONFIGURATION
 * Declares the nested route tree mapping URLs to elements.
 * ============================================================
 */
const router = createBrowserRouter([
  {
    // Public routes nested inside PublicLayout (sharing same Header and Footer)
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: PATHS.HOME,
        element: <LandingPage />,
      },
      {
        path: PATHS.LOGIN,
        element: <LoginPage />,
      },
      {
        path: PATHS.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: PATHS.EMI_CALCULATOR,
        element: <EMICalculatorPage />,
      },
      {
        path: PATHS.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: '/oauth2/callback',
        element: <OAuth2CallbackPage />,
      },
    ],
  },
  {
    // PROTECTED WORKSPACE PATHS (Wrapped in ProtectedRoute gates)
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        // Workspace pages share the same Sidebar + Header Layout
        element: <DashboardLayout />,
        children: [
          // Borrower Paths
          {
            path: PATHS.BORROWER_DASHBOARD,
            element: <BorrowerDashboard />,
          },
          {
            path: PATHS.BORROWER_APPLICATIONS,
            element: <MyApplicationsPage />,
          },
          {
            path: PATHS.BORROWER_LOANS,
            element: <MyLoansPage />,
          },
          {
            path: PATHS.BORROWER_EMI_CALENDAR,
            element: <EMICalendarPage />,
          },
          {
            path: PATHS.BORROWER_SUPPORT,
            element: <SupportPage />,
          },
          {
            path: PATHS.BORROWER_APPLY,
            element: <LoanApplicationPage />,
          },
          {
            path: PATHS.BORROWER_PROFILE,
            element: <BorrowerProfilePage />,
          },
          {
            path: PATHS.BORROWER_DOCUMENTS,
            element: <DocumentsPage />,
          },
          {
            path: PATHS.BORROWER_STATEMENTS,
            element: <StatementsPage />,
          },

          // Officer Paths
          {
            path: PATHS.OFFICER_DASHBOARD,
            element: <OfficerDashboard />,
          },
          {
            path: PATHS.OFFICER_QUEUE,
            element: <ApplicationQueuePage />,
          },
          {
            path: PATHS.OFFICER_PERFORMANCE,
            element: <PerformanceTrackerPage />,
          },

          // Manager Paths
          {
            path: PATHS.MANAGER_DASHBOARD,
            element: <ManagerDashboard />,
          },
          {
            path: PATHS.MANAGER_APPROVALS,
            element: <ApprovalQueuePage />,
          },
          {
            path: PATHS.MANAGER_PORTFOLIO,
            element: <PortfolioReportsPage />,
          },
          {
            path: PATHS.MANAGER_TEAM,
            element: <TeamManagementPage />,
          },
          {
            path: PATHS.MANAGER_DISBURSEMENTS,
            element: <DisbursementsPage />,
          },
          {
            path: PATHS.MANAGER_NPA,
            element: <NPAMonitorPage />,
          },

          // Admin Paths
          {
            path: PATHS.ADMIN_DASHBOARD,
            element: <AdminDashboard />,
          },
          {
            path: PATHS.ADMIN_USERS,
            element: <ManageUsersPage />,
          },
          {
            path: PATHS.ADMIN_AUDIT_TRAIL,
            element: <AuditTrailPage />,
          },
          {
            path: PATHS.ADMIN_SETTINGS,
            element: <AdminSettingsPage />,
          }
        ],
      },
    ],
  },
  {
    // Catch-all route for invalid URLs (404 Page)
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
