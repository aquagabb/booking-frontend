import React from 'react';
import { Mail, Phone, User } from 'lucide-react';
import type { ClientDetailsProps } from './types';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ClientDetails: React.FC<ClientDetailsProps> = ({ item }) => {
  return (
    <div className="">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Client Information</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
              <p className="text-xs text-gray-500">Customer Name</p>
            <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{item.customerEmail}</p>
          </div>
        </div>
        {item.customerPhone && (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{item.customerPhone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;