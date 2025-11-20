import React from 'react';
import { format } from 'date-fns';
import { User, Bot, Shield, Lock } from 'lucide-react';
import { Message } from '../api/tickets';

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
    if (isInternal) return 'bg-yellow-50 border-yellow-200';
    if (isCustomer) return 'bg-gray-50 border-gray-200';
    if (isAgent) return 'bg-blue-50 border-blue-200';
    if (isBot) return 'bg-purple-50 border-purple-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getIcon = () => {
    if (isAgent) return <Shield className="h-4 w-4 text-blue-600" />;
    if (isBot) return <Bot className="h-4 w-4 text-purple-600" />;
    if (isCustomer) return <User className="h-4 w-4 text-gray-600" />;
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
    <div className={`rounded-lg border p-4 ${getBackgroundColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="text-sm font-medium text-gray-900">
            {getSenderLabel()}
          </span>
          {isInternal && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              <Lock className="h-3 w-3 mr-1" />
              Internal Note
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
        </span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {message.content}
      </div>
      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {message.attachments.map((attachment: any, index: number) => (
            <a
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline block"
            >
              {attachment.file_name || `Attachment ${index + 1}`}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
