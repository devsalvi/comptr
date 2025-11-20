import React from 'react';
import { MessageCircle, Mail, Facebook, Twitter, MessageSquare, Instagram } from 'lucide-react';

interface ChannelBadgeProps {
  channel: string;
}

const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel }) => {
  const getChannelConfig = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return {
          icon: Mail,
          label: 'Email',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'facebook':
        return {
          icon: Facebook,
          label: 'Facebook',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'twitter':
        return {
          icon: Twitter,
          label: 'Twitter',
          className: 'bg-sky-100 text-sky-800',
        };
      case 'whatsapp':
      case 'whatsapp_business':
        return {
          icon: MessageCircle,
          label: 'WhatsApp',
          className: 'bg-green-100 text-green-800',
        };
      case 'instagram':
        return {
          icon: Instagram,
          label: 'Instagram',
          className: 'bg-pink-100 text-pink-800',
        };
      case 'web_chat':
        return {
          icon: MessageSquare,
          label: 'Web Chat',
          className: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          icon: MessageSquare,
          label: channel,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getChannelConfig(channel);
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

export default ChannelBadge;
