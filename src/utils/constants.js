// ============================================================
// APPLICATION CONSTANTS
// Single source of truth for all hardcoded values in the app.
// Every component imports from here instead of using raw strings.
// ============================================================

// --- User Roles ---
// These match what the backend will return in the JWT token.
// Used in: AuthContext, route guards, sidebar menus, permission checks.
export const ROLES = {
  BORROWER: 'BORROWER',
  OFFICER: 'OFFICER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
}

// --- Loan Application Statuses ---
// The lifecycle of a loan application from submission to completion.
// Used in: StatusBadge component, application tracker, queue filters.
export const APPLICATION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  DOC_VERIFICATION: 'DOC_VERIFICATION',
  CREDIT_CHECK: 'CREDIT_CHECK',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RECOMMENDED_APPROVE: 'RECOMMENDED_APPROVE',
  RECOMMENDED_REJECT: 'RECOMMENDED_REJECT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DISBURSEMENT_PENDING: 'DISBURSEMENT_PENDING',
  DISBURSED: 'DISBURSED',
  CANCELLED: 'CANCELLED',
}

// --- Loan Statuses (after disbursement) ---
// Used in: Loan detail page, NPA management, borrower dashboard.
export const LOAN_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  NPA: 'NPA',
  WRITTEN_OFF: 'WRITTEN_OFF',
}

// --- Loan Types ---
// Each type has different required documents, rate ranges, and eligibility.
// Used in: Loan application wizard, product cards, filters.
export const LOAN_TYPES = {
  PERSONAL: 'PERSONAL',
  HOME: 'HOME',
  VEHICLE: 'VEHICLE',
  EDUCATION: 'EDUCATION',
  BUSINESS: 'BUSINESS',
  GOLD: 'GOLD',
}

// --- Human-readable labels for loan types ---
// Maps internal codes to display text.
// Used in: Any UI that shows loan type to the user.
export const LOAN_TYPE_LABELS = {
  [LOAN_TYPES.PERSONAL]: 'Personal Loan',
  [LOAN_TYPES.HOME]: 'Home Loan',
  [LOAN_TYPES.VEHICLE]: 'Vehicle Loan',
  [LOAN_TYPES.EDUCATION]: 'Education Loan',
  [LOAN_TYPES.BUSINESS]: 'Business Loan',
  [LOAN_TYPES.GOLD]: 'Gold Loan',
}

// --- Loan Type Icons (emoji for now, will use Lucide icons later) ---
export const LOAN_TYPE_ICONS = {
  [LOAN_TYPES.PERSONAL]: '💰',
  [LOAN_TYPES.HOME]: '🏠',
  [LOAN_TYPES.VEHICLE]: '🚗',
  [LOAN_TYPES.EDUCATION]: '🎓',
  [LOAN_TYPES.BUSINESS]: '💼',
  [LOAN_TYPES.GOLD]: '🪙',
}

// --- Document Types ---
// What documents a borrower must upload.
// Used in: Document upload step, officer verification.
export const DOCUMENT_TYPES = {
  ID_PROOF: 'ID_PROOF',
  ADDRESS_PROOF: 'ADDRESS_PROOF',
  INCOME_PROOF: 'INCOME_PROOF',
  BANK_STATEMENT: 'BANK_STATEMENT',
  PROPERTY_DOCS: 'PROPERTY_DOCS',
  PHOTO: 'PHOTO',
  OTHER: 'OTHER',
}

export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.ID_PROOF]: 'Identity Proof (PAN / Aadhaar / Passport)',
  [DOCUMENT_TYPES.ADDRESS_PROOF]: 'Address Proof',
  [DOCUMENT_TYPES.INCOME_PROOF]: 'Income Proof (Salary Slip / ITR)',
  [DOCUMENT_TYPES.BANK_STATEMENT]: 'Bank Statement (Last 6 Months)',
  [DOCUMENT_TYPES.PROPERTY_DOCS]: 'Property Documents',
  [DOCUMENT_TYPES.PHOTO]: 'Passport Size Photo',
  [DOCUMENT_TYPES.OTHER]: 'Other Documents',
}

// --- Document Verification Status ---
export const DOC_STATUS = {
  UPLOADED: 'UPLOADED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
}

// --- EMI Payment Status ---
export const EMI_STATUS = {
  UPCOMING: 'UPCOMING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
}

// --- NPA Classification (RBI norms) ---
export const NPA_CLASSIFICATION = {
  SMA_0: 'SMA_0',   // 1-30 days overdue
  SMA_1: 'SMA_1',   // 31-60 days overdue
  SMA_2: 'SMA_2',   // 61-90 days overdue
  NPA: 'NPA',        // 90+ days overdue
}

// --- Support Ticket Status ---
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
}

// --- Priority Levels ---
export const PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

// --- Employment Types ---
export const EMPLOYMENT_TYPES = {
  SALARIED: 'SALARIED',
  SELF_EMPLOYED: 'SELF_EMPLOYED',
  BUSINESS: 'BUSINESS',
  RETIRED: 'RETIRED',
  STUDENT: 'STUDENT',
}

export const EMPLOYMENT_TYPE_LABELS = {
  [EMPLOYMENT_TYPES.SALARIED]: 'Salaried',
  [EMPLOYMENT_TYPES.SELF_EMPLOYED]: 'Self Employed',
  [EMPLOYMENT_TYPES.BUSINESS]: 'Business Owner',
  [EMPLOYMENT_TYPES.RETIRED]: 'Retired',
  [EMPLOYMENT_TYPES.STUDENT]: 'Student',
}

// --- Application Status Labels + Colors (for StatusBadge component) ---
// Maps status codes to display properties.
export const STATUS_CONFIG = {
  [APPLICATION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-slate-100 text-slate-600',
  },
  [APPLICATION_STATUS.SUBMITTED]: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700',
  },
  [APPLICATION_STATUS.DOC_VERIFICATION]: {
    label: 'Document Verification',
    color: 'bg-amber-100 text-amber-700',
  },
  [APPLICATION_STATUS.CREDIT_CHECK]: {
    label: 'Credit Check',
    color: 'bg-purple-100 text-purple-700',
  },
  [APPLICATION_STATUS.UNDER_REVIEW]: {
    label: 'Under Review',
    color: 'bg-orange-100 text-orange-700',
  },
  [APPLICATION_STATUS.RECOMMENDED_APPROVE]: {
    label: 'Recommended for Approval',
    color: 'bg-teal-100 text-teal-700',
  },
  [APPLICATION_STATUS.RECOMMENDED_REJECT]: {
    label: 'Recommended for Rejection',
    color: 'bg-rose-100 text-rose-700',
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: 'Approved',
    color: 'bg-emerald-100 text-emerald-700',
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
  },
  [APPLICATION_STATUS.DISBURSEMENT_PENDING]: {
    label: 'Approved (Pending Disbursement)',
    color: 'bg-cyan-100 text-cyan-700',
  },
  [APPLICATION_STATUS.DISBURSED]: {
    label: 'Approved & Disbursed',
    color: 'bg-emerald-100 text-emerald-700',
  },
  [APPLICATION_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-500',
  },
}

// --- Validation Limits ---
// Used in: Form validation, loan application wizard.
export const LIMITS = {
  MIN_LOAN_AMOUNT: 50000,        // ₹50,000
  MAX_LOAN_AMOUNT: 10000000,     // ₹1,00,00,000 (1 Crore)
  MIN_TENURE_MONTHS: 6,
  MAX_TENURE_MONTHS: 360,         // 30 years
  MIN_AGE: 18,
  MAX_AGE: 65,
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  SESSION_TIMEOUT_MINUTES: 20,
}

// --- Pagination ---
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
}

// --- Navigation Paths ---
// Centralized route paths. If a route URL changes, update only here.
export const PATHS = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  EMI_CALCULATOR: '/emi-calculator',

  // Borrower
  BORROWER_DASHBOARD: '/borrower/dashboard',
  BORROWER_APPLY: '/borrower/apply',
  BORROWER_APPLICATIONS: '/borrower/applications',
  BORROWER_LOANS: '/borrower/loans',
  BORROWER_EMI_CALENDAR: '/borrower/emi-calendar',
  BORROWER_SUPPORT: '/borrower/support',
  BORROWER_PROFILE: '/borrower/profile',
  BORROWER_NOTIFICATIONS: '/borrower/notifications',

  // Officer
  OFFICER_DASHBOARD: '/officer/dashboard',
  OFFICER_QUEUE: '/officer/queue',
  OFFICER_PERFORMANCE: '/officer/performance',
  OFFICER_NOTIFICATIONS: '/officer/notifications',
  OFFICER_PROFILE: '/officer/profile',

  // Manager
  MANAGER_DASHBOARD: '/manager/dashboard',
  MANAGER_APPROVALS: '/manager/approvals',
  MANAGER_PORTFOLIO: '/manager/portfolio',
  MANAGER_TEAM: '/manager/team',
  MANAGER_DISBURSEMENTS: '/manager/disbursements',
  MANAGER_NPA: '/manager/npa',
  MANAGER_REPORTS: '/manager/reports',
  MANAGER_NOTIFICATIONS: '/manager/notifications',
  MANAGER_PROFILE: '/manager/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_RATES: '/admin/rates',
  ADMIN_FEES: '/admin/fees',
  ADMIN_MASTER_DATA: '/admin/master-data',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_TRAIL: '/admin/audit-trail',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_PROFILE: '/admin/profile',

  // Error
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
}
