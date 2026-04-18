import React, { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import type { Conversation, ConversationListProps } from './index';
import ConversationItem from './ConversationItem';

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  selectedConversationId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }

    const searchLower = searchTerm.toLowerCase();
    return conversations.filter((conv) => {
      return (
        conv.bookingCode.toLowerCase().includes(searchLower) ||
        conv.locationName?.toLowerCase().includes(searchLower) ||
        conv.locationTitle?.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, searchTerm]);

  const handleConversationClick = useCallback(
    (conversation: Conversation) => {
      onSelectConversation?.(conversation);
    },
    [onSelectConversation]
  );

  return (
    <div 
      className="w-full bg-white border border-gray-200 rounded-lg flex flex-col" 
      style={{ maxHeight: '600px' }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={handleConversationClick}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;