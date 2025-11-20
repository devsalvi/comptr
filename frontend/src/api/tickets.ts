import apiClient from './client';

export interface Ticket {
  ticket_id: string;
  created_at: string;
  updated_at: string;
  status: 'new' | 'open' | 'pending_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_agent_id?: string;
  tags: string[];
  source: {
    channel: string;
    origin_platform_id: string;
    is_bot_handoff: boolean;
  };
  customer: {
    internal_id: string;
    name?: string;
    primary_email?: string;
    channel_identity: string;
  };
  subject: string;
  timeline: Message[];
}

export interface Message {
  message_id: string;
  timestamp: string;
  sender_type: 'customer' | 'agent' | 'bot' | 'system';
  content: string;
  content_type: string;
  visibility: 'public' | 'internal';
  agent_id?: string;
  attachments?: any[];
}

export interface TicketFilters {
  status?: string;
  assigned_agent_id?: string;
  page?: number;
  page_size?: number;
}

export const ticketsApi = {
  // Get all tickets
  getTickets: async (filters?: TicketFilters) => {
    const response = await apiClient.get('/api/tickets/', { params: filters });
    return response.data;
  },

  // Get single ticket
  getTicket: async (ticketId: string): Promise<Ticket> => {
    const response = await apiClient.get(`/api/tickets/${ticketId}`);
    return response.data;
  },

  // Update ticket
  updateTicket: async (ticketId: string, updates: Partial<Ticket>) => {
    const response = await apiClient.put(`/api/tickets/${ticketId}`, updates);
    return response.data;
  },

  // Add message to ticket
  addMessage: async (
    ticketId: string,
    message: {
      content: string;
      sender_type?: string;
      visibility?: 'public' | 'internal';
    }
  ) => {
    const response = await apiClient.post(
      `/api/tickets/${ticketId}/message`,
      message
    );
    return response.data;
  },

  // Assign ticket
  assignTicket: async (ticketId: string, agentId: string) => {
    const response = await apiClient.put(
      `/api/tickets/${ticketId}/assign`,
      null,
      { params: { agent_id: agentId } }
    );
    return response.data;
  },
};
