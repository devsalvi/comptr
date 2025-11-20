import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { ArrowLeft, Send, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ChannelBadge from '../components/ChannelBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import MessageBubble from '../components/MessageBubble';

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [messageContent, setMessageContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch ticket data
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getTicket(ticketId!),
    enabled: !!ticketId,
    refetchInterval: 5000, // Poll for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: { content: string; visibility: 'public' | 'internal' }) =>
      ticketsApi.addMessage(ticketId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setMessageContent('');
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      ticketsApi.updateTicket(ticketId!, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    sendMessageMutation.mutate({
      content: messageContent,
      visibility: isInternalNote ? 'internal' : 'public',
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tickets
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {ticket.subject}
              </h1>
              <div className="flex items-center space-x-3 mb-3">
                <ChannelBadge channel={ticket.source.channel} />
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div className="text-sm text-gray-600">
                <p>Customer: {ticket.customer.name || ticket.customer.channel_identity}</p>
                {ticket.customer.primary_email && (
                  <p>Email: {ticket.customer.primary_email}</p>
                )}
                <p>Ticket ID: {ticket.ticket_id}</p>
                <p>Created: {format(new Date(ticket.created_at), 'PPpp')}</p>
              </div>
            </div>

            {/* Status selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus || ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="pending_customer">Pending Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conversation Timeline
          </h2>
          <div className="space-y-4">
            {ticket.timeline.map((message) => (
              <MessageBubble key={message.message_id} message={message} />
            ))}
          </div>
        </div>
      </div>

      {/* Reply Box */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-0">
        <div className="mb-3">
          <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center">
              {isInternalNote ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Internal Note (not visible to customer)
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Public Reply (sent to customer)
                </>
              )}
            </span>
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSendMessage();
              }
            }}
            placeholder={
              isInternalNote
                ? 'Add an internal note...'
                : 'Type your reply to the customer...'
            }
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Cmd/Ctrl + Enter to send
          </p>
          <button
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || sendMessageMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send {isInternalNote ? 'Note' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
