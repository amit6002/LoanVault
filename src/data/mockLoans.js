import { LOAN_TYPES, DOCUMENT_TYPES } from '../utils/constants';

/**
 * ============================================================
 * MOCK DATA STORE FOR LOANS & PRODUCTS
 * Simulates database configurations. Used inside calculators,
 * drop menus, and dashboards.
 * ============================================================
 */

// 1. Available Loan Products Configured in the System
export const MOCK_LOAN_PRODUCTS = [
  {
    id: 'PROD-PERSONAL',
    type: LOAN_TYPES.PERSONAL,
    name: 'Personal Flexi Loan',
    minAmount: 50000,
    maxAmount: 1500000,
    minTenure: 12, // Months
    maxTenure: 60,
    interestRate: 10.5, // P.A.
    processingFeePercent: 1.5,
    requiredDocs: [DOCUMENT_TYPES.ID_PROOF, DOCUMENT_TYPES.INCOME_PROOF, DOCUMENT_TYPES.BANK_STATEMENT],
  },
  {
    id: 'PROD-HOME',
    type: LOAN_TYPES.HOME,
    name: 'Home Prime Loan',
    minAmount: 500000,
    maxAmount: 10000000,
    minTenure: 60,
    maxTenure: 360,
    interestRate: 8.4,
    processingFeePercent: 0.5,
    requiredDocs: [DOCUMENT_TYPES.ID_PROOF, DOCUMENT_TYPES.ADDRESS_PROOF, DOCUMENT_TYPES.INCOME_PROOF, DOCUMENT_TYPES.BANK_STATEMENT, DOCUMENT_TYPES.PROPERTY_DOCS],
  },
  {
    id: 'PROD-VEHICLE',
    type: LOAN_TYPES.VEHICLE,
    name: 'Auto Drive Loan',
    minAmount: 100000,
    maxAmount: 5000000,
    minTenure: 12,
    maxTenure: 84,
    interestRate: 9.2,
    processingFeePercent: 1.0,
    requiredDocs: [DOCUMENT_TYPES.ID_PROOF, DOCUMENT_TYPES.ADDRESS_PROOF, DOCUMENT_TYPES.INCOME_PROOF, DOCUMENT_TYPES.BANK_STATEMENT],
  },
  {
    id: 'PROD-BUSINESS',
    type: LOAN_TYPES.BUSINESS,
    name: 'MSME Growth Loan',
    minAmount: 200000,
    maxAmount: 8000000,
    minTenure: 24,
    maxTenure: 120,
    interestRate: 12.0,
    processingFeePercent: 2.0,
    requiredDocs: [DOCUMENT_TYPES.ID_PROOF, DOCUMENT_TYPES.ADDRESS_PROOF, DOCUMENT_TYPES.INCOME_PROOF, DOCUMENT_TYPES.BANK_STATEMENT],
  }
];

// 2. Pre-configured active applications to simulate initial user history
export const MOCK_APPLICATIONS = [
  {
    id: 'APP-2026-00812',
    type: LOAN_TYPES.HOME,
    amount: 5000000,
    tenureMonths: 240,
    status: 'DOC_VERIFICATION',
    appliedDate: '10 Jul 2026',
    remarks: 'Waiting for Income Proof verification.',
  },
  {
    id: 'APP-2026-00431',
    type: LOAN_TYPES.PERSONAL,
    amount: 500000,
    tenureMonths: 36,
    status: 'APPROVED',
    appliedDate: '01 Jul 2026',
    remarks: 'Loan terms accepted. Ready for disbursement.',
  }
];
