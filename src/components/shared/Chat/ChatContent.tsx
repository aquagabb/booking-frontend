import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { createMessage } from '../../../api/chat/chat';
import clsx from 'clsx';
import type { Message, ChatContentProps, Conversation } from './index';
import { formatDate, getInitials } from '../../../lib/utils';
import { StatusBadge } from '../StatusBadge';
import MessageItem from './MessageItem';

interface ChatHeaderProps {
    conversation: Conversation;
    onBookingDetails: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onBookingDetails }) => {
    return (
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {getInitials(conversation.locationName)}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.locationName}
                    </h2>
                    {conversation.bookingCode && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                #{conversation.bookingCode}
                            </span>
                        </div>
                    )}
                    {(conversation.checkIn || conversation.checkOut) && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {conversation.checkIn && (
                                <span>Check-in: {formatDate(conversation.checkIn)}</span>
                            )}
                            {conversation.checkOut && (
                                <span>Check-out: {formatDate(conversation.checkOut)}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <StatusBadge status={conversation.status} />
                    {conversation.bookingId && conversation.bookingCode && (
                        <button
                            onClick={onBookingDetails}
                            className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Booking Details</span>
                            <span className="sm:hidden">Details</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ChatFooterProps {
    inputMessage: string;
    setInputMessage: (value: string) => void;
    sending: boolean;
    onSendMessage: () => void;
    onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ChatFooter: React.FC<ChatFooterProps> = ({
    inputMessage,
    setInputMessage,
    sending,
    onSendMessage,
    onKeyPress,
    textareaRef,
}) => {
    return (
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div>
                <div className="flex items-end gap-2 sm:gap-3">
                    <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={onKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent overflow-y-auto"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        onClick={onSendMessage}
                        disabled={!inputMessage.trim() || sending}
                        className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatContent: React.FC<ChatContentProps> = ({
    conversation,
    messages,
    isAdmin,
    onMessageSent,
}) => {
    const navigate = useNavigate();
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleBookingDetails = () => {
        if (conversation?.bookingId && conversation?.bookingCode) {
            navigate(`/booking/view/${conversation.bookingId}/${conversation.bookingCode}`);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversation || sending) return;

        try {
            setSending(true);
            const { status } = await createMessage({
                bookingId: conversation.id,
                isCustomer: !isAdmin,
                payloadMessage: {
                    text: inputMessage,
                },
                type: 'text',
            });

            if (status === 200 || status === 201) {
                setInputMessage('');
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
                if (onMessageSent) {
                    onMessageSent();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputMessage]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const messagesByDate = messages.reduce((acc, message) => {
        const date = new Date(message.createdAt);
        const dateKey = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(message);
        return acc;
    }, {} as Record<string, Message[]>);

    const groupConsecutiveMessages = (messages: Message[]) => {
        const TIME_WINDOW = 5 * 60 * 1000;
        const groups: Message[][] = [];
        let currentGroup: Message[] = [];

        messages.forEach((message, index) => {
            if (index === 0) {
                currentGroup.push(message);
            } else {
                const prevMessage = messages[index - 1];
                const timeDiff = new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
                const sameSender = message.senderId === prevMessage.senderId;

                if (sameSender && timeDiff < TIME_WINDOW) {
                    currentGroup.push(message);
                } else {
                    groups.push([...currentGroup]);
                    currentGroup = [message];
                }
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Select a conversation</p>
                    <p className="text-sm">Choose a conversation from the list to view messages</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <ChatHeader conversation={conversation} onBookingDetails={handleBookingDetails} />

            <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-6">
                    {Object.entries(messagesByDate).map(([dateKey, dateMessages]) => {
                        const messageGroups = groupConsecutiveMessages(dateMessages);

                        return (
                            <React.Fragment key={dateKey}>

                                <div className="text-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                        {dateKey}
                                    </span>
                                </div>

                                {messageGroups.map((group, groupIndex) => {
                                    const firstMessage = group[0];
                                    const lastMessage = group[group.length - 1];

                                    const isRightText = firstMessage.isCustomer && !isAdmin || !firstMessage.isCustomer && isAdmin;

                                    return (
                                        <div
                                            key={`group-${groupIndex}`}
                                            className={clsx(
                                                'flex items-start gap-3',
                                                isRightText ? 'flex-row-reverse' : ''
                                            )}
                                        >

                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    {getInitials(firstMessage.senderName)}
                                                </span>
                                            </div>

                                            <div className={clsx(
                                                'flex-1 space-y-1',
                                                isRightText ? 'flex flex-col items-end' : ''
                                            )}>
                                                <p className={clsx(
                                                    'text-xs font-medium text-gray-700 dark:text-gray-300 mb-1',
                                                    isRightText ? 'text-right' : ''
                                                )}>
                                                    {firstMessage.senderName}
                                                </p>

                                                {group.map((message) => {
                                                    const shouldHaveBackground = message.type === 'text' && isRightText;

                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={clsx(
                                                                'rounded-lg p-4 shadow-sm border max-w-[80%]',
                                                                shouldHaveBackground
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-white'
                                                            )}
                                                        >
                                                            <MessageItem message={message} />
                                                        </div>
                                                    );
                                                })}

                                                <p className={clsx(
                                                    'text-xs text-gray-400 dark:text-gray-500 mt-1',
                                                    !isRightText ? 'mr-1' : 'ml-1'
                                                )}>
                                                    {new Date(lastMessage.createdAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}

                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <ChatFooter
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                sending={sending}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                textareaRef={textareaRef}
            />
        </div>
    );
};

export default ChatContent;
