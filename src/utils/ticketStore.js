/**
 * ============================================================
 * SUPPORT TICKET & CHAT STORE
 * Persists support tickets and real-time messages between
 * Borrower and Loan Officer in localStorage.
 * ============================================================
 */
const TICKET_STORAGE_KEY = 'lms_support_tickets_v2';

const INITIAL_TICKETS = [
  {
    id: 'TKT-2026-9081',
    borrowerName: 'Rahul Sharma',
    borrowerEmail: 'rahul.sharma@example.com',
    category: 'EMI',
    subject: 'EMI Payment auto-debit confirmation query',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-20 10:15 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'BORROWER',
        senderName: 'Rahul Sharma',
        text: 'Hi, I paid my Business Loan EMI for August manually. Will the auto-debit trigger again on 5th August?',
        timestamp: '2026-07-20 10:15 AM',
      },
      {
        id: 'msg-2',
        sender: 'OFFICER',
        senderName: 'Amit Kumar (Loan Officer)',
        text: 'Hello Rahul, since you paid manually, your NACH auto-debit mandate for August 2026 has been marked AS PAID and will not execute again. Your account is clear!',
        timestamp: '2026-07-20 10:30 AM',
      }
    ]
  }
];

export const ticketStore = {
  getTickets: () => {
    const data = localStorage.getItem(TICKET_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(data);
  },

  createTicket: ({ category, subject, description, borrowerName = 'Rahul Sharma', borrowerEmail = 'rahul.sharma@example.com' }) => {
    const tickets = ticketStore.getTickets();
    const newTicket = {
      id: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      borrowerName,
      borrowerEmail,
      category,
      subject,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'BORROWER',
          senderName: borrowerName,
          text: description,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
    return newTicket;
  },

  addReply: (ticketId, { text, sender = 'OFFICER', senderName = 'Loan Officer' }) => {
    const tickets = ticketStore.getTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: sender === 'OFFICER' ? 'RESOLVED' : 'IN_PROGRESS',
          messages: [
            ...t.messages,
            {
              id: `msg-${Date.now()}`,
              sender,
              senderName,
              text,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      }
      return t;
    });

    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
