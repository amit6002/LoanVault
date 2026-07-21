import { api } from '../api/apiClient';

/**
 * ============================================================
 * CENTRAL SUPPORT TICKET & CHAT STORE
 * Persists continuous support ticket threads with status workflow
 * (OPEN -> OFFICER_REPLIED -> REOPENED -> RESOLVED -> CLOSED)
 * and syncs with backend REST APIs with localStorage fallback.
 * ============================================================
 */
const TICKET_STORAGE_KEY = 'lms_support_tickets_v3';

const INITIAL_TICKETS = [
  {
    id: 9081,
    ticketId: 'TKT-2026-9081',
    borrowerId: 1,
    borrowerName: 'Rahul Sharma',
    borrowerEmail: 'rahul.sharma@example.com',
    category: 'EMI',
    subject: 'EMI Payment auto-debit confirmation query',
    status: 'OFFICER_REPLIED',
    createdAt: '2026-07-20 10:15 AM',
    unreadMessagesCount: 1,
    messages: [
      {
        id: 1,
        senderRole: 'BORROWER',
        senderName: 'Rahul Sharma',
        text: 'Hi, I paid my Business Loan EMI for August manually. Will the auto-debit trigger again on 5th August?',
        timestamp: '2026-07-20 10:15 AM',
        isRead: true,
      },
      {
        id: 2,
        senderRole: 'OFFICER',
        senderName: 'Amit Kumar (Loan Officer)',
        text: 'Hello Rahul, since you paid manually, your NACH auto-debit mandate for August 2026 has been marked AS PAID and will not execute again. Your account is clear!',
        timestamp: '2026-07-20 10:30 AM',
        isRead: false,
      }
    ]
  }
];

export const ticketStore = {
  getTickets: async (isOfficer = false) => {
    try {
      const endpoint = isOfficer ? '/api/support/tickets/officer' : '/api/support/tickets/my';
      const data = await api.get(endpoint).catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Backend tickets fetch fallback to local storage:', err);
    }

    return ticketStore.getLocalTickets();
  },

  createTicket: async ({ category, subject, description, borrowerName = 'Rahul Sharma' }) => {
    try {
      const res = await api.post('/api/support/tickets', { category, subject, description }).catch(() => null);
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Create ticket backend error, fallback local:', err);
    }

    const tickets = ticketStore.getLocalTickets();
    const newTicket = {
      id: Date.now(),
      ticketId: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      borrowerId: 1,
      borrowerName,
      borrowerEmail: 'rahul.sharma@example.com',
      category,
      subject,
      description,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      unreadMessagesCount: 0,
      messages: [
        {
          id: Date.now(),
          senderRole: 'BORROWER',
          senderName: borrowerName,
          text: description,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
    return newTicket;
  },

  addMessage: async (ticketId, { text, senderRole = 'BORROWER', senderName = 'Rahul Sharma' }) => {
    try {
      await api.post(`/api/support/tickets/${ticketId}/messages`, { text }).catch(() => null);
    } catch (err) {
      console.warn('Add message backend error, fallback local:', err);
    }

    const tickets = ticketStore.getLocalTickets();
    const updated = tickets.map(t => {
      const isMatch = t.id === ticketId || 
                      t.ticketId === ticketId || 
                      String(t.id) === String(ticketId) || 
                      String(t.ticketId) === String(ticketId);
      if (isMatch) {
        const isOfficer = senderRole === 'OFFICER';
        let newStatus = t.status;

        if (isOfficer) {
          newStatus = 'OFFICER_REPLIED';
        } else if (t.status === 'OFFICER_REPLIED' || t.status === 'RESOLVED') {
          newStatus = 'REOPENED';
        }

        return {
          ...t,
          status: newStatus,
          unreadMessagesCount: isOfficer ? (t.unreadMessagesCount || 0) + 1 : t.unreadMessagesCount,
          messages: [
            ...(t.messages || []),
            {
              id: Date.now(),
              senderRole,
              senderName,
              text,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              isRead: !isOfficer,
            }
          ]
        };
      }
      return t;
    });

    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  updateStatus: async (ticketId, status) => {
    try {
      await api.put(`/api/support/tickets/${ticketId}/status?status=${status}`).catch(() => null);
    } catch (err) {
      console.warn('Update status backend error, fallback local:', err);
    }

    const tickets = ticketStore.getLocalTickets();
    const updated = tickets.map(t => {
      const isMatch = t.id === ticketId || 
                      t.ticketId === ticketId || 
                      String(t.id) === String(ticketId) || 
                      String(t.ticketId) === String(ticketId);
      if (isMatch) {
        return { ...t, status };
      }
      return t;
    });
    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  markAsRead: async (ticketId) => {
    try {
      await api.post(`/api/support/tickets/${ticketId}/read`).catch(() => null);
    } catch (err) {
      console.warn('Mark as read backend error:', err);
    }

    const tickets = ticketStore.getLocalTickets();
    const updated = tickets.map(t => {
      const isMatch = t.id === ticketId || 
                      t.ticketId === ticketId || 
                      String(t.id) === String(ticketId) || 
                      String(t.ticketId) === String(ticketId);
      if (isMatch) {
        const readMsgs = (t.messages || []).map(m => m.senderRole === 'OFFICER' ? { ...m, isRead: true } : m);
        return { ...t, messages: readMsgs, unreadMessagesCount: 0 };
      }
      return t;
    });
    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(updated));
  },

  getUnreadCount: () => {
    const tickets = ticketStore.getLocalTickets();
    let totalUnread = 0;
    tickets.forEach(t => {
      if (t.messages && Array.isArray(t.messages)) {
        t.messages.forEach(m => {
          if (m.senderRole === 'OFFICER' && !m.isRead) {
            totalUnread++;
          }
        });
      }
    });
    return totalUnread;
  },

  getLocalTickets: () => {
    const data = localStorage.getItem(TICKET_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_TICKETS;
    }
  }
};
