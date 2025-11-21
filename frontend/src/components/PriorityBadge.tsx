import React from 'react';
import { Tag } from 'antd';
import {
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return {
          icon: <ThunderboltOutlined />,
          label: 'Critical',
          color: 'red',
        };
      case 'high':
        return {
          icon: <ExclamationCircleOutlined />,
          label: 'High',
          color: 'orange',
        };
      case 'medium':
        return {
          icon: <WarningOutlined />,
          label: 'Medium',
          color: 'gold',
        };
      case 'low':
        return {
          icon: <InfoCircleOutlined />,
          label: 'Low',
          color: 'default',
        };
      default:
        return {
          icon: <InfoCircleOutlined />,
          label: priority,
          color: 'default',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.label}
    </Tag>
  );
};

export default PriorityBadge;
