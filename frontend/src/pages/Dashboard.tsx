import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import {
  Filter,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChannelBadge from '../components/ChannelBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: () => ticketsApi.getTickets({ status: statusFilter || undefined }),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const tickets: Ticket[] = data?.tickets || [];

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getLastMessage = (ticket: Ticket) => {
    if (ticket.timeline.length === 0) return null;
    return ticket.timeline[ticket.timeline.length - 1];
  };

  return (
    <div>
      {/* Header - Apple Style */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold text-apple-gray-900 tracking-tight">
            Support Tickets
          </h1>
          <p className="mt-2 text-base text-apple-gray-600">
            Unified inbox for all customer support channels
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-apple-blue hover:bg-apple-blue-dark shadow-apple transition-all hover:shadow-apple-lg active:scale-95"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters - Apple Style */}
      <div className="mb-6 flex items-center space-x-3">
        <Filter className="h-5 w-5 text-apple-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block rounded-lg border-apple-gray-300 bg-white px-4 py-2 text-sm font-medium text-apple-gray-700 shadow-apple focus:border-apple-blue focus:ring-2 focus:ring-apple-blue focus:ring-opacity-50 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="pending_customer">Pending Customer</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Ticket List - Apple Style */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-apple-blue"></div>
          <p className="mt-4 text-sm font-medium text-apple-gray-600">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-apple-lg">
          <MessageSquare className="mx-auto h-16 w-16 text-apple-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-apple-gray-900">No tickets</h3>
          <p className="mt-2 text-sm text-apple-gray-600">
            {statusFilter ? 'No tickets match your filters' : 'No support tickets yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const lastMessage = getLastMessage(ticket);
            return (
              <div
                key={ticket.ticket_id}
                onClick={() => handleTicketClick(ticket.ticket_id)}
                className="bg-white rounded-2xl shadow-apple hover:shadow-apple-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <ChannelBadge channel={ticket.source.channel} />
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        {ticket.source.is_bot_handoff && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Bot Handoff
                          </span>
                        )}
                      </div>
                      <p className="text-base font-semibold text-apple-gray-900 truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-apple-gray-600 mt-1">
                        {ticket.customer.name || ticket.customer.channel_identity}
                      </p>
                      {lastMessage && (
                        <p className="text-sm text-apple-gray-500 mt-3 line-clamp-2">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="ml-6 flex-shrink-0 text-right">
                      <p className="text-xs font-medium text-apple-gray-500 flex items-center justify-end">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatDistanceToNow(new Date(ticket.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-xs text-apple-gray-400 mt-2">
                        {ticket.timeline.length} {ticket.timeline.length === 1 ? 'message' : 'messages'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
