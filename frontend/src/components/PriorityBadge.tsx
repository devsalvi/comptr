import React from 'react';
import { AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return {
          icon: Zap,
          label: 'Critical',
          className: 'bg-red-100 text-red-800',
        };
      case 'high':
        return {
          icon: AlertCircle,
          label: 'High',
          className: 'bg-orange-100 text-orange-800',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          label: 'Medium',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'low':
        return {
          icon: Info,
          label: 'Low',
          className: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          icon: Info,
          label: priority,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
