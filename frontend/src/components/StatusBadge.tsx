import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return {
          label: 'New',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'open':
        return {
          label: 'Open',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'pending_customer':
        return {
          label: 'Pending Customer',
          className: 'bg-orange-100 text-orange-800',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          className: 'bg-green-100 text-green-800',
        };
      case 'closed':
        return {
          label: 'Closed',
          className: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
