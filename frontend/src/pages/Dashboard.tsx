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
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Unified inbox for all customer support channels
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="pending_customer">Pending Customer</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter ? 'No tickets match your filters' : 'No support tickets yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const lastMessage = getLastMessage(ticket);
              return (
                <li
                  key={ticket.ticket_id}
                  onClick={() => handleTicketClick(ticket.ticket_id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <ChannelBadge channel={ticket.source.channel} />
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                          {ticket.source.is_bot_handoff && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Bot Handoff
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.customer.name || ticket.customer.channel_identity}
                        </p>
                        {lastMessage && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(ticket.updated_at), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {ticket.timeline.length} messages
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
