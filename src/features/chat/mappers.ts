import type { ChatMessageItem, Message } from './types';

const messageTimestampFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const formatMessageTimestamp = (createdAt: string): string => {
  return messageTimestampFormatter.format(new Date(createdAt)).replace(',', '');
};

export const mapMessageToChatMessageItem = (
  message: Message,
  variant: ChatMessageItem['variant'] = 'incoming',
): ChatMessageItem => {
  return {
    id: message._id,
    author: variant === 'outgoing' ? undefined : message.author,
    body: message.message,
    timestamp: formatMessageTimestamp(message.createdAt),
    variant,
  };
};
