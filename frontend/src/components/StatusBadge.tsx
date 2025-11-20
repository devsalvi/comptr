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
          className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        };
      case 'open':
        return {
          label: 'Open',
          className: 'bg-blue-50 text-apple-blue border border-blue-200',
        };
      case 'pending_customer':
        return {
          label: 'Pending',
          className: 'bg-orange-50 text-orange-700 border border-orange-200',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          className: 'bg-green-50 text-green-700 border border-green-200',
        };
      case 'closed':
        return {
          label: 'Closed',
          className: 'bg-apple-gray-100 text-apple-gray-700 border border-apple-gray-200',
        };
      default:
        return {
          label: status,
          className: 'bg-apple-gray-100 text-apple-gray-700 border border-apple-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
