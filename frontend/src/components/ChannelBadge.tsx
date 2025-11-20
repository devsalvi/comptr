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
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'facebook':
        return {
          icon: Facebook,
          label: 'Facebook',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'twitter':
        return {
          icon: Twitter,
          label: 'Twitter',
          className: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'whatsapp':
      case 'whatsapp_business':
        return {
          icon: MessageCircle,
          label: 'WhatsApp',
          className: 'bg-green-50 text-green-700 border-green-200',
        };
      case 'instagram':
        return {
          icon: Instagram,
          label: 'Instagram',
          className: 'bg-pink-50 text-pink-700 border-pink-200',
        };
      case 'web_chat':
        return {
          icon: MessageSquare,
          label: 'Web Chat',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          icon: MessageSquare,
          label: channel,
          className: 'bg-apple-gray-100 text-apple-gray-700 border-apple-gray-200',
        };
    }
  };

  const config = getChannelConfig(channel);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

export default ChannelBadge;
