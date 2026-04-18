import React from 'react';
import {
  Utensils,
  Camera,
  Flower2,
  Music,
  Coffee,
  Sparkles,
} from 'lucide-react';
import type { ServicesProps } from './types';

const getServiceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('waiter') || lowerName.includes('server')) return Utensils;
  if (lowerName.includes('photo') || lowerName.includes('video')) return Camera;
  if (lowerName.includes('flower') || lowerName.includes('decoration')) return Flower2;
  if (lowerName.includes('music') || lowerName.includes('band')) return Music;
  if (lowerName.includes('catering') || lowerName.includes('food')) return Coffee;
  return Sparkles;
};

const Services: React.FC<ServicesProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Services & Add-ons</h2>
      {item.services.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No services added</p>
      ) : (
        <div className="space-y-4">
          {item.services.map((service) => {
            const Icon = getServiceIcon(service.name);
            return (
              <div
                key={service.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {service.quantity} × €{service.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    €{service.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
