import React, { memo, useCallback } from 'react';
import clsx from 'clsx';
import type { Conversation } from './index';
import { formatDate, getInitials } from '../../../lib/utils';
import { StatusBadge } from '../StatusBadge';

export interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (conversation: Conversation) => void;
}

const getDisplayName = (c: Conversation) =>
  c.locationName || c.locationTitle || `Booking ${c.bookingCode}`;

const getSubtitle = (c: Conversation) => {
  if (c.customerName) return c.customerName;
  if (c.locationTitle && c.locationTitle !== c.locationName)
    return c.locationTitle;
  return null;
};

const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, isSelected, onClick }) => {
    const isUnread = !conversation.is_seen;

    const handleClick = useCallback(() => {
      onClick(conversation);
    }, [onClick, conversation]);

    const displayName = getDisplayName(conversation);
    const subtitle = getSubtitle(conversation);
    const initials = getInitials(
      conversation.customerName || conversation.locationName || ''
    );

    const Avatar = ({ initials }: { initials: string }) => (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-orange-700">
          {initials}
        </span>
      </div>
    );

    const Header = ({
      title,
      isUnread,
    }: {
      title: string;
      isUnread: boolean;
    }) => (
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-gray-900 text-sm truncate">
          {title}
        </span>
        {isUnread && (
          <span
            className="ml-auto w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"
            aria-label="Unread message"
          />
        )}
      </div>
    );

    const Footer = ({ conversation }: { conversation: Conversation }) => (
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {formatDate(conversation.lastMessageAt)}
        </span>
        <StatusBadge status={conversation.status} />
      </div>
    );


    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Conversation: ${displayName}`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={clsx(
          'p-4 mb-2 rounded-lg cursor-pointer transition-colors',
          isSelected
            ? 'bg-orange-50 border border-orange-200'
            : 'hover:bg-gray-50'
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar initials={initials} />

          <div className="flex-1 min-w-0">
            <Header
              title={displayName}
              isUnread={isUnread}
            />

            {subtitle && (
              <p className="text-xs text-gray-500 truncate mb-1">
                {subtitle}
              </p>
            )}

            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {conversation.lastMessage || 'No messages yet'}
            </p>

            <Footer conversation={conversation} />
          </div>
        </div>
      </div>
    );
  }
);


export default ConversationItem;






