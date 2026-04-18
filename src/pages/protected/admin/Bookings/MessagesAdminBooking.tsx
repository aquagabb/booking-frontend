import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore - chat.js doesn't have TypeScript definitions
import { getMessages, getConversations } from '../../../../api/chat/chat';
import ChatContent from '../../../../components/shared/Chat/ChatContent';
import type { Conversation, Message } from '../../../../components/shared/Chat';

interface MessagesAdminBookingProps {
  bookingId: number | null;
  slug?: string;
}

const MessagesAdminBooking: React.FC<MessagesAdminBookingProps> = ({ slug }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConversationByBookingId = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Extract booking code from slug (format: {id}-{code})
      const bookingCode = slug.includes('-') ? slug.split('-').slice(1).join('-') : slug;

      const { status, response } = await getConversations(false);
      if (status === 200 && response?.data) {
        const conversations = response.data;
        // Match by bookingCode since the API response doesn't include bookingId
        const foundConversation = conversations.find(
          (conv: Conversation) => conv.bookingCode === bookingCode
        );

        if (foundConversation) {
          setConversation(foundConversation);
          const messagesResponse = await getMessages(foundConversation.id);
          if (messagesResponse.status === 200) {
            setMessages(messagesResponse.response?.data || []);
          }
        } else {
          setConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchConversationByBookingId();
  }, [fetchConversationByBookingId]);

  const handleMessageSent = async () => {
    if (conversation) {

      const messagesResponse = await getMessages(conversation.id);
      if (messagesResponse.status === 200) {
        setMessages(messagesResponse.response?.data || []);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center text-gray-500">
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No conversation found</p>
          <p className="text-sm">No chat messages available for this booking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] rounded-lg overflow-hidden border border-gray-200">
      <ChatContent
        isAdmin={true}
        conversation={conversation}
        messages={messages}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default MessagesAdminBooking;
