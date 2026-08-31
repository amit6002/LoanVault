/**
 * ============================================================
 * LOAN STORE & STATE MANAGER
 * Centralized dynamic loan state manager for Borrower Portal.
 * Handles loan data, EMI payments, balance deductions,
 * transaction logging, and real-time reflection across pages.
 * ============================================================
 */

function getStorageInfo() {
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const userKey = session.email ? `_${session.email.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  const isDemoUser = session.email === 'borrower@loanvault.com' || !session.email;
  return {
    loansKey: `lms_borrower_loans_v2${userKey}`,
    txnsKey: `lms_borrower_txns_v2${userKey}`,
    isDemoUser,
  };
}

export const loanStore = {
  getLoans: () => {
    const { loansKey, isDemoUser } = getStorageInfo();
    try {
      const stored = localStorage.getItem(loansKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored loans', e);
    }
    const defaultData = isDemoUser ? DEFAULT_LOANS : [];
    localStorage.setItem(loansKey, JSON.stringify(defaultData));
    return defaultData;
  },

  getTransactions: () => {
    const { txnsKey, isDemoUser } = getStorageInfo();
    try {
      const stored = localStorage.getItem(txnsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored txns', e);
    }
    const defaultData = isDemoUser ? DEFAULT_TXNS : [];
    localStorage.setItem(txnsKey, JSON.stringify(defaultData));
    return defaultData;
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

    const { loansKey, txnsKey } = getStorageInfo();
    localStorage.setItem(loansKey, JSON.stringify(updatedLoans));
    localStorage.setItem(txnsKey, JSON.stringify(txns));
    return { loans: updatedLoans, txns };
  },

  resetStore: () => {
    const { loansKey, txnsKey, isDemoUser } = getStorageInfo();
    const defaultData = isDemoUser ? DEFAULT_LOANS : [];
    const defaultTxns = isDemoUser ? DEFAULT_TXNS : [];
    localStorage.setItem(loansKey, JSON.stringify(defaultData));
    localStorage.setItem(txnsKey, JSON.stringify(defaultTxns));
    return { loans: defaultData, txns: defaultTxns };
  }
};
