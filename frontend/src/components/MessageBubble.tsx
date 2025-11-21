import React from 'react';
import { format } from 'date-fns';
import { Card, Tag, Typography, Space, Avatar } from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  SafetyOutlined,
  LockOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { Message } from '../api/tickets';

const { Text, Link } = Typography;

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isCustomer = message.sender_type === 'customer';
  const isAgent = message.sender_type === 'agent';
  const isBot = message.sender_type === 'bot';
  const isSystem = message.sender_type === 'system';
  const isInternal = message.visibility === 'internal';

  const getBackgroundColor = () => {
    if (isInternal) return '#fffbe6';
    if (isCustomer) return '#fafafa';
    if (isAgent) return '#e6f7ff';
    if (isBot) return '#f9f0ff';
    return '#fafafa';
  };

  const getBorderColor = () => {
    if (isInternal) return '#ffe58f';
    if (isCustomer) return '#d9d9d9';
    if (isAgent) return '#91d5ff';
    if (isBot) return '#d3adf7';
    return '#d9d9d9';
  };

  const getIcon = () => {
    if (isAgent) return <SafetyOutlined style={{ color: '#1890ff' }} />;
    if (isBot) return <RobotOutlined style={{ color: '#722ed1' }} />;
    if (isCustomer) return <UserOutlined style={{ color: '#595959' }} />;
    if (isSystem) return <DesktopOutlined style={{ color: '#595959' }} />;
    return null;
  };

  const getSenderLabel = () => {
    if (isAgent) return 'Agent';
    if (isBot) return 'Bot';
    if (isCustomer) return 'Customer';
    if (isSystem) return 'System';
    return 'Unknown';
  };

  return (
    <Card
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="small">
            <Avatar size="small" icon={getIcon()} style={{ backgroundColor: 'transparent' }} />
            <Text strong>{getSenderLabel()}</Text>
            {isInternal && (
              <Tag color="warning" icon={<LockOutlined />}>
                Internal Note
              </Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
          </Text>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          <Text>{message.content}</Text>
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <Space direction="vertical" size="small">
            {message.attachments.map((attachment: any, index: number) => (
              <Link
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {attachment.file_name || `Attachment ${index + 1}`}
              </Link>
            ))}
          </Space>
        )}
      </Space>
    </Card>
  );
};

export default MessageBubble;
