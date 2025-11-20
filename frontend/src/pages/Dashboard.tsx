import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, Ticket } from '../api/tickets';
import {
  Filter,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Inbox
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

  // Calculate stats
  const stats = useMemo(() => {
    const allTickets = data?.tickets || [];
    return {
      total: allTickets.length,
      new: allTickets.filter((t: Ticket) => t.status === 'new').length,
      open: allTickets.filter((t: Ticket) => t.status === 'open').length,
      resolved: allTickets.filter((t: Ticket) => t.status === 'resolved').length,
    };
  }, [data]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getLastMessage = (ticket: Ticket) => {
    if (ticket.timeline.length === 0) return null;
    return ticket.timeline[ticket.timeline.length - 1];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-semibold text-apple-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 text-lg text-apple-gray-600">
            Unified inbox for all customer support channels
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-apple-blue hover:bg-apple-blue-dark shadow-apple-lg transition-all hover:shadow-apple-xl active:scale-95"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-apple-gray-50 rounded-2xl shadow-apple-lg p-6 border border-apple-gray-100 hover:shadow-apple-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-apple-gray-600">Total Tickets</p>
              <p className="text-4xl font-semibold text-apple-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Inbox className="h-7 w-7 text-apple-blue" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-apple-lg p-6 border border-yellow-100 hover:shadow-apple-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-apple-gray-600">New</p>
              <p className="text-4xl font-semibold text-apple-gray-900 mt-2">{stats.new}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-apple-lg p-6 border border-blue-100 hover:shadow-apple-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-apple-gray-600">Open</p>
              <p className="text-4xl font-semibold text-apple-gray-900 mt-2">{stats.open}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-apple-blue" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-apple-lg p-6 border border-green-100 hover:shadow-apple-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-apple-gray-600">Resolved</p>
              <p className="text-4xl font-semibold text-apple-gray-900 mt-2">{stats.resolved}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-apple p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-apple-gray-500" />
          <span className="text-sm font-semibold text-apple-gray-700">Filter by:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border-apple-gray-300 bg-apple-gray-50 px-4 py-2 text-sm font-medium text-apple-gray-700 shadow-sm focus:border-apple-blue focus:ring-2 focus:ring-apple-blue focus:ring-opacity-50 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="pending_customer">Pending Customer</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="text-sm font-medium text-apple-gray-600">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </div>
      </div>

      {/* Tickets Section */}
      <div>
        <h2 className="text-2xl font-semibold text-apple-gray-900 mb-6 tracking-tight">
          Recent Tickets
        </h2>

        {isLoading ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-apple-lg">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-apple-blue border-t-transparent"></div>
            <p className="mt-6 text-base font-medium text-apple-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-24 bg-gradient-to-br from-white to-apple-gray-50 rounded-2xl shadow-apple-lg border border-apple-gray-100">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-apple-gray-100 mb-6">
              <MessageSquare className="h-10 w-10 text-apple-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-apple-gray-900">No tickets found</h3>
            <p className="mt-3 text-base text-apple-gray-600 max-w-md mx-auto">
              {statusFilter ? 'No tickets match your current filters. Try adjusting your filter criteria.' : 'No support tickets yet. New tickets will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const lastMessage = getLastMessage(ticket);
              return (
                <div
                  key={ticket.ticket_id}
                  onClick={() => handleTicketClick(ticket.ticket_id)}
                  className="bg-white rounded-2xl shadow-apple hover:shadow-apple-lg cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.98] border border-apple-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center flex-wrap gap-2 mb-4">
                          <ChannelBadge channel={ticket.source.channel} />
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                          {ticket.source.is_bot_handoff && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Bot Handoff
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-apple-gray-900 mb-2 line-clamp-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm font-medium text-apple-gray-600 mb-3">
                          {ticket.customer.name || ticket.customer.channel_identity}
                        </p>
                        {lastMessage && (
                          <p className="text-sm text-apple-gray-500 line-clamp-2 leading-relaxed">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right space-y-3">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-apple-gray-50 border border-apple-gray-200">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-apple-gray-500" />
                          <span className="text-xs font-medium text-apple-gray-700">
                            {formatDistanceToNow(new Date(ticket.updated_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-apple-gray-500">
                          <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
                          {ticket.timeline.length} {ticket.timeline.length === 1 ? 'message' : 'messages'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
