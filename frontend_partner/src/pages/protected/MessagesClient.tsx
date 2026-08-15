import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getMessages, getConversations } from "../../api/chat/chat";
import ConversationList from "../../components/shared/Chat/ConversationList";
import ChatContent from "../../components/shared/Chat/ChatContent";
import type { Conversation, Message } from "../../components/shared/Chat";

const MessagesClient = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const fetchMessagesForConversation = async (conversationId: number) => {
    const { status, response } = await getMessages(conversationId);
    if (status === 200) {
      setMessages(response.data || []);
    }
  };

  const fetchConversations = async () => {
    const { status, response } = await getConversations();
    if (status === 200) {
      setConversations(response.data || []);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const conversationIdParam = searchParams.get('conversationId');
    if (conversationIdParam && conversations.length > 0) {
      const conversationId = parseInt(conversationIdParam, 10);
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && conversation.id !== selectedConversation?.id) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversations, searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForConversation(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversationId: conversation.id.toString() });
  };

  return (
    <div>
      <div className="flex h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          <ConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <ChatContent
            isAdmin={false}
            conversation={selectedConversation}
            messages={messages}
            onMessageSent={() => {
              if (selectedConversation) {
                fetchMessagesForConversation(selectedConversation.id);
                fetchConversations();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesClient;
