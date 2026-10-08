import React from 'react';
import { Mail, Phone, User, Edit2 } from 'lucide-react';
import { withFallback } from '../../../../lib/utils';
import type { ClientDetailsProps } from './types';

const ClientDetails: React.FC<ClientDetailsProps> = ({ item, onEdit }) => {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">2. Informații Client</h2>
          <p className="text-xs text-gray-500 mt-0.5">Datele organizatorului principal și entitatea plătitoare</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm flex-shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            Editare
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Nume Client</p>
            <p className="text-sm font-medium text-gray-900">{withFallback(item.customerName)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{withFallback(item.customerEmail)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Telefon</p>
            <p className="text-sm font-medium text-gray-900">{withFallback(item.customerPhone)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
