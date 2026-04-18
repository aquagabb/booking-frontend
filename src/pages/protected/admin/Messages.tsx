import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  Check,
  Send
} from 'lucide-react';
import { updateBooking } from '../../../api/bookings/bookings';
import clsx from 'clsx';

type ReservationRequest = {
  id: string;
  code: string;
  locationName: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  message?: string;
  createdAt: string;
  unread?: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: string;
};

// Dummy data for reservation requests
const dummyReservations: ReservationRequest[] = [
  {
    id: '1',
    code: 'BK001',
    locationName: 'Grand Palace Hotel',
    eventName: 'Wedding Reception',
    customerName: 'Alice Johnson',
    customerEmail: 'alice.johnson@example.com',
    customerPhone: '+40744555111',
    checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 6 hours later
    guests: 120,
    status: 'pending',
    message: 'Hello! Can I update my reservation for the wedding reception? I need to add two more guests to the room. Is that possible?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unread: true,
  },
  {
    id: '2',
    code: 'BK002',
    locationName: 'Mountain Retreat',
    eventName: 'Corporate Meeting',
    customerName: 'Bob Smith',
    customerEmail: 'bob.smith@example.com',
    customerPhone: '+40744555222',
    checkIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    guests: 25,
    status: 'pending',
    message: 'I would like to book the conference room for our quarterly meeting. We need space for 25 people with AV equipment and catering services.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    unread: true,
  },
  {
    id: '3',
    code: 'BK003',
    locationName: 'City Center Hall',
    eventName: 'Birthday Party',
    customerName: 'Charlie Brown',
    customerEmail: 'charlie.brown@example.com',
    customerPhone: '+40744555333',
    checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 5 hours later
    guests: 50,
    status: 'pending',
    message: 'Hi! I\'m planning a birthday celebration for my daughter. We need a space that can accommodate 50 guests with a dance floor and sound system. Do you have availability?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    unread: true,
  },
];

const Messages = () => {
  const [reservations, setReservations] = useState<ReservationRequest[]>(dummyReservations);
  const [selectedReservation, setSelectedReservation] = useState<ReservationRequest | null>(dummyReservations[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAccept = async () => {
    if (!selectedReservation) return;
    
    try {
      setProcessing(true);
      const { status } = await updateBooking(selectedReservation.id, {
        status: 'confirmed',
      });
      
      if (status) {
        setReservations(prev => 
          prev.map(r => 
            r.id === selectedReservation.id 
              ? { ...r, status: 'confirmed' as const, unread: false }
              : r
          )
        );
        setSelectedReservation(prev => prev ? { ...prev, status: 'confirmed' as const, unread: false } : null);
      }
    } catch (error) {
      console.error('Error accepting reservation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReservation) return;
    
    try {
      setProcessing(true);
      const { status } = await updateBooking(selectedReservation.id, {
        status: 'cancelled',
      });
      
      if (status) {
        setReservations(prev => 
          prev.map(r => 
            r.id === selectedReservation.id 
              ? { ...r, status: 'cancelled' as const, unread: false }
              : r
          )
        );
        setSelectedReservation(prev => prev ? { ...prev, status: 'cancelled' as const, unread: false } : null);
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  };

  const formatDate = (iso: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Initialize messages when reservation is selected
  useEffect(() => {
    if (selectedReservation && !messages[selectedReservation.id]) {
      const initialMessages: Message[] = [
        {
          id: '1',
          text: selectedReservation.message || `Hello! I would like to make a reservation for ${selectedReservation.eventName} at ${selectedReservation.locationName}.`,
          sender: 'customer',
          timestamp: selectedReservation.createdAt,
        },
      ];
      setMessages(prev => {
        if (prev[selectedReservation.id]) return prev;
        return {
          ...prev,
          [selectedReservation.id]: initialMessages,
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReservation?.id]);


  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedReservation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'admin',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedReservation.id]: [...(prev[selectedReservation.id] || []), newMessage],
    }));

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const filteredReservations = reservations.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(searchLower) ||
      r.locationName.toLowerCase().includes(searchLower) ||
      r.eventName.toLowerCase().includes(searchLower) ||
      r.customerEmail.toLowerCase().includes(searchLower)
    );
  });

  const pendingReservations = filteredReservations.filter(r => r.status === 'pending');
  const otherReservations = filteredReservations.filter(r => r.status !== 'pending');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Conversation List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search message, name, etc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pending Reservations */}
          {pendingReservations.length > 0 && (
            <div className="p-2">
              {pendingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  onClick={() => setSelectedReservation(reservation)}
                  className={clsx(
                    'p-4 rounded-lg cursor-pointer transition-colors mb-2',
                    selectedReservation?.id === reservation.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-orange-700">
                        {getInitials(reservation.customerName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {reservation.customerName}
                        </span>
                        {reservation.unread && (
                          <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {reservation.locationName}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {reservation.message || `${reservation.eventName} - ${reservation.guests} guests`}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(reservation.createdAt)}
                        </span>
                        {selectedReservation?.id === reservation.id && (
                          <Check className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Reservations */}
          {otherReservations.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              {otherReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  onClick={() => setSelectedReservation(reservation)}
                  className={clsx(
                    'p-4 rounded-lg cursor-pointer transition-colors mb-2',
                    selectedReservation?.id === reservation.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-700">
                        {getInitials(reservation.customerName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {reservation.customerName}
                        </span>
                        <span className={clsx(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}>
                          {reservation.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {reservation.locationName}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {reservation.message || `${reservation.eventName} - ${reservation.guests} guests`}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(reservation.createdAt)}
                        </span>
                        {selectedReservation?.id === reservation.id && (
                          <Check className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredReservations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No reservation requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Reservation Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedReservation ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-700">
                      {getInitials(selectedReservation.customerName)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedReservation.customerName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedReservation.customerEmail}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {selectedReservation.status === 'pending' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="px-4 py-2  border  flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="px-4 py-2 bg-primary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                ) : (
                  <div className={clsx(
                    'px-4 py-2 rounded-lg font-medium',
                    selectedReservation.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}>
                    {selectedReservation.status === 'confirmed' ? 'Approved' : 'Rejected'}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Date Separator */}
                {selectedReservation && messages[selectedReservation.id] && messages[selectedReservation.id].length > 0 && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(selectedReservation.createdAt)}
                    </span>
                  </div>
                )}

                {/* Customer Message */}
                {selectedReservation && messages[selectedReservation.id] && messages[selectedReservation.id].length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-orange-700">
                        {getInitials(selectedReservation.customerName)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {messages[selectedReservation.id][0].text}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">
                        {formatTime(messages[selectedReservation.id][0].timestamp)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reservation Details Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Reservation Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.locationName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Event Type</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.eventName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(selectedReservation.checkIn)} at {formatTime(selectedReservation.checkIn)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(selectedReservation.checkOut)} at {formatTime(selectedReservation.checkOut)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.guests} guests</p>
                      </div>
                    </div>
                    {selectedReservation.customerPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-gray-400">📞</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedReservation.customerPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Messages (Admin replies) */}
                {selectedReservation && messages[selectedReservation.id] && messages[selectedReservation.id].length > 1 && (
                  <>
                    {messages[selectedReservation.id].slice(1).map((message) => (
                      <div
                        key={message.id}
                        className={clsx(
                          'flex items-start gap-3',
                          message.sender === 'admin' ? 'flex-row-reverse' : ''
                        )}
                      >
                        <div className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          message.sender === 'customer'
                            ? 'bg-gradient-to-br from-orange-200 to-amber-200'
                            : 'bg-gradient-to-br from-blue-200 to-blue-300'
                        )}>
                          <span className={clsx(
                            'text-xs font-semibold',
                            message.sender === 'customer' ? 'text-orange-700' : 'text-blue-700'
                          )}>
                            {message.sender === 'customer' 
                              ? getInitials(selectedReservation.customerName)
                              : 'A'
                            }
                          </span>
                        </div>
                        <div className={clsx(
                          'flex-1',
                          message.sender === 'admin' ? 'flex flex-col items-end' : ''
                        )}>
                          <div className={clsx(
                            'rounded-lg p-4 shadow-sm border max-w-[80%]',
                            message.sender === 'customer'
                              ? 'bg-white border-gray-200'
                              : 'bg-primary text-white border-primary'
                          )}>
                            <p className={clsx(
                              'text-sm whitespace-pre-wrap',
                              message.sender === 'customer' ? 'text-gray-800' : 'text-white'
                            )}>
                              {message.text}
                            </p>
                          </div>
                          <p className={clsx(
                            'text-xs text-gray-400 mt-1',
                            message.sender === 'admin' ? 'mr-1' : 'ml-1'
                          )}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent overflow-y-auto"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || processing}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Select a reservation request</p>
              <p className="text-sm">Choose a message from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
