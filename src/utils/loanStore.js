/**
 * ============================================================
 * LOAN STORE & STATE MANAGER
 * Centralized dynamic loan state manager for Borrower Portal.
 * Handles loan data, EMI payments, balance deductions,
 * transaction logging, and real-time reflection across pages.
 * ============================================================
 */

const STORAGE_KEY_LOANS = 'lms_borrower_loans_v2';
const STORAGE_KEY_TXNS = 'lms_borrower_txns_v2';

const DEFAULT_LOANS = [
  {
    id: 'LN-APP-2026-05327',
    name: 'Business Loan',
    status: 'ACTIVE',
    sanctionedAmount: 800000,
    outstandingPrincipal: 200000,
    interestRate: 12.0,
    tenureMonths: 24,
    paidMonths: 12,
    emiAmount: 9414.69,
    principalComponent: 8534.10,
    interestComponent: 880.59,
    nextEmiDate: '2026-08-05',
    dueDateLabel: '05 Aug 2026',
    paidThisMonth: false,
  },
  {
    id: 'LN-APP-2026-27758',
    name: 'Vehicle Loan',
    status: 'ACTIVE',
    sanctionedAmount: 1040800,
    outstandingPrincipal: 1040800,
    interestRate: 9.25,
    tenureMonths: 60,
    paidMonths: 0,
    emiAmount: 9249.71,
    principalComponent: 8350.00,
    interestComponent: 899.71,
    nextEmiDate: '2026-08-10',
    dueDateLabel: '10 Aug 2026',
    paidThisMonth: false,
  },
  {
    id: 'LN-APP-2026-00812',
    name: 'Home Loan',
    status: 'SUBMITTED',
    sanctionedAmount: 5500000,
    outstandingPrincipal: 0,
    interestRate: 8.4,
    tenureMonths: 240,
    paidMonths: 0,
    emiAmount: 0,
    principalComponent: 0,
    interestComponent: 0,
    nextEmiDate: '-',
    dueDateLabel: '-',
    paidThisMonth: false,
  }
];

const DEFAULT_TXNS = [
  { id: 'TXN-8012', loanId: 'LN-APP-2026-05327', name: 'EMI Payment', type: 'DEBIT', amount: 9414.69, date: '05 Jul 2026', status: 'SUCCESS' },
  { id: 'TXN-8011', loanId: 'LN-APP-2026-05327', name: 'Loan Disbursed', type: 'CREDIT', amount: 800000, date: '20 Jul 2026', status: 'SUCCESS' },
  { id: 'TXN-8010', loanId: 'LN-APP-2026-05327', name: 'Processing Fee', type: 'DEBIT', amount: 2500, date: '18 Jul 2026', status: 'SUCCESS' },
  { id: 'TXN-7911', loanId: 'LN-APP-2026-27758', name: 'Vehicle Loan Disbursed', type: 'CREDIT', amount: 1040800, date: '18 Jun 2026', status: 'SUCCESS' },
];

export const loanStore = {
  getLoans: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOANS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored loans', e);
    }
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(DEFAULT_LOANS));
    return DEFAULT_LOANS;
  },

  getTransactions: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TXNS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored txns', e);
    }
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(DEFAULT_TXNS));
    return DEFAULT_TXNS;
  },

  payEmi: (loanId) => {
    const loans = loanStore.getLoans();
    const txns = loanStore.getTransactions();

    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId && !loan.paidThisMonth && loan.status === 'ACTIVE') {
        // Only deduct the principal component (not interest) from outstanding balance
        // If principalComponent is stored, use it; otherwise compute ~70% of EMI as principal
        const principalDeducted = loan.principalComponent > 0
          ? loan.principalComponent
          : Math.round(loan.emiAmount * 0.7 * 100) / 100;

        const newOutstanding = Math.max(0, loan.outstandingPrincipal - principalDeducted);
        const newPaidMonths = loan.paidMonths + 1;
        const remainingEmis = loan.tenureMonths - newPaidMonths;

        // Advance the next EMI due date by one month
        const currentDueDate = loan.nextEmiDate && loan.nextEmiDate !== '-'
          ? new Date(loan.nextEmiDate)
          : new Date();
        const nextDue = new Date(currentDueDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        const nextEmiDateStr = nextDue.toISOString().split('T')[0];
        const nextDueDateLabel = nextDue.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });

        // Determine if the loan is now fully repaid
        const isFullyRepaid = newOutstanding === 0 || remainingEmis <= 0;

        // Log the EMI payment transaction
        const newTxn = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          loanId: loan.id,
          name: `${loan.name} EMI Payment`,
          type: 'DEBIT',
          amount: loan.emiAmount,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'SUCCESS',
        };
        txns.unshift(newTxn);

        return {
          ...loan,
          outstandingPrincipal: newOutstanding,
          paidMonths: newPaidMonths,
          paidThisMonth: true,                // reset each month — see comment below
          nextEmiDate: isFullyRepaid ? '-' : nextEmiDateStr,
          dueDateLabel: isFullyRepaid ? '-' : nextDueDateLabel,
          status: isFullyRepaid ? 'CLOSED' : 'ACTIVE',
        };
      }
      return loan;
    });

    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(updatedLoans));
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
    return { loans: updatedLoans, txns };
  },

  resetStore: () => {
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(DEFAULT_LOANS));
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(DEFAULT_TXNS));
    return { loans: DEFAULT_LOANS, txns: DEFAULT_TXNS };
  }
};
