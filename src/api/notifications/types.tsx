export type ClientNotificationPayload = {
  translationKey: string;
  clientName?: string;
  locationName?: string;
  bookingCode?: string;
  [key: string]: unknown;
};

export type ClientNotification = {
  id: number;
  userId: number;
  organizationId: number;
  type: string;
  itemId: number;
  payload: ClientNotificationPayload;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
};
