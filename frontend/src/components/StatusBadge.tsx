import React from 'react';
import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return {
          label: 'New',
          color: 'gold',
        };
      case 'open':
        return {
          label: 'Open',
          color: 'blue',
        };
      case 'pending_customer':
        return {
          label: 'Pending',
          color: 'orange',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: 'green',
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'default',
        };
      default:
        return {
          label: status,
          color: 'default',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tag color={config.color}>
      {config.label}
    </Tag>
  );
};

export default StatusBadge;
