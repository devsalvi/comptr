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
          className: 'bg-red-50 text-red-700 border border-red-200',
        };
      case 'high':
        return {
          icon: AlertCircle,
          label: 'High',
          className: 'bg-orange-50 text-orange-700 border border-orange-200',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          label: 'Medium',
          className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        };
      case 'low':
        return {
          icon: Info,
          label: 'Low',
          className: 'bg-apple-gray-100 text-apple-gray-600 border border-apple-gray-200',
        };
      default:
        return {
          icon: Info,
          label: priority,
          className: 'bg-apple-gray-100 text-apple-gray-600 border border-apple-gray-200',
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
