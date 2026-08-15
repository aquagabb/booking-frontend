export type Message = {
  id: number;
  bookingId: number;
  senderId: number;
  payload: {
    text: string;
  };
  type: string;
  isCustomer: boolean;
  createdAt: string;
  seenAt: string | null;
  updatedAt: string;
  senderName: string;
  senderEmail: string;
};

export type Conversation = {
  id: number;
  bookingId: number;
  bookingCode: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  is_seen?: boolean;
  locationName?: string;
  locationTitle?: string;
  customerName?: string;
  customerEmail?: string;
};

export type ChatContentProps = {
  conversation: Conversation | null;
  messages: Message[];
  isAdmin: boolean;
  onMessageSent?: () => void;
};

export type ConversationListProps = {
  conversations: Conversation[];
  onSelectConversation?: (conversation: Conversation) => void;
  selectedConversationId?: number;
};
