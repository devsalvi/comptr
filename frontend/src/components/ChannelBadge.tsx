import React from 'react';
import { Tag } from 'antd';
import {
  MessageOutlined,
  MailOutlined,
  FacebookOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  InstagramOutlined,
  CommentOutlined,
} from '@ant-design/icons';

interface ChannelBadgeProps {
  channel: string;
}

const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel }) => {
  const getChannelConfig = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return {
          icon: <MailOutlined />,
          label: 'Email',
          color: 'blue',
        };
      case 'facebook':
        return {
          icon: <FacebookOutlined />,
          label: 'Facebook',
          color: 'blue',
        };
      case 'twitter':
        return {
          icon: <TwitterOutlined />,
          label: 'Twitter',
          color: 'cyan',
        };
      case 'whatsapp':
      case 'whatsapp_business':
        return {
          icon: <WhatsAppOutlined />,
          label: 'WhatsApp',
          color: 'green',
        };
      case 'instagram':
        return {
          icon: <InstagramOutlined />,
          label: 'Instagram',
          color: 'magenta',
        };
      case 'web_chat':
        return {
          icon: <CommentOutlined />,
          label: 'Web Chat',
          color: 'purple',
        };
      default:
        return {
          icon: <MessageOutlined />,
          label: channel,
          color: 'default',
        };
    }
  };

  const config = getChannelConfig(channel);

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.label}
    </Tag>
  );
};

export default ChannelBadge;
