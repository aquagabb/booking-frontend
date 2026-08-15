import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import type { Message } from './index';
import { formatDate } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';

interface MessageItemProps {
    message: Message;
}

const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
        guests: 'Number of Guests',
        checkIn: 'Check-in Date',
        checkOut: 'Check-out Date',
    };
    return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

const formatFieldValue = (field: string, value: any): string => {
    if (field === 'checkIn' || field === 'checkOut') {
        return formatDate(value);
    }
    return String(value);
};

const getFieldIcon = (field: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
        guests: <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />,
        checkIn: <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />,
        checkOut: <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />,
    };
    return icons[field] || <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
};

const getStatusConfig = (status: 'waiting_approval' | 'approved' | 'rejected') => {
  const configs = {
    waiting_approval: {
      text: 'Reservation is waiting for approval',
      textColor: 'text-amber-600',
    },
    approved: {
      text: 'Reservation changes have been approved',
      textColor: 'text-emerald-600',
    },
    rejected: {
      text: 'Reservation changes have been rejected',
      textColor: 'text-rose-600',
    },
  };
  
    return configs[status];
};

const ModificationRequestContent: React.FC<{ message: Message }> = ({ message }) => {
    const payload = message.payload as { 
        type: 'booking_fields_edit' | 'booking_dates_edit'; 
        status: 'waiting_approval' | 'approved' | 'rejected';
        changes: any[] 
    };
    
    const title = payload.type === 'booking_fields_edit' 
        ? 'Modification Request' 
        : 'Date Change Request';

    const statusConfig = getStatusConfig(payload.status);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{title}</span>
                </div>
             
            </div>
            
            <div className="space-y-3">
                {payload.changes.map((change, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                            {getFieldIcon(change.field)}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatFieldName(change.field)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">From:</p>
                                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {formatFieldValue(change.field, change.oldValue)}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">To:</p>
                                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {formatFieldValue(change.field, change.newValue)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="px-3 py-2">
                <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                    {statusConfig.text}
                </span>
            </div>
        </div>
    );
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isTextMessage = message.type === 'text';
    const isModificationRequest = message.type === 'request_modifications';

    const { t } = useTranslation();

    if (isTextMessage) {
        const payload = message.payload as {
            text?: string;
                translationKey?: string;
        };

        return (
         <p className="text-sm whitespace-pre-wrap">
      {payload.translationKey
        ? t(payload.translationKey)
        : payload.text}
    </p>
        );
    }

    if (isModificationRequest) {
        return <ModificationRequestContent message={message} />;
    }

    return (
        <p className="text-sm italic opacity-70">
            Unsupported message type: {message.type}
        </p>
    );
};

export default MessageItem;
