import { authRequest } from '../request';

export const getUnreadMessagesCount = async () => {
  // return await authRequest('GET', '/messages/unread-count');
};

export const getClientNotifications = async (page?: number, size?: number) => {
  let query = '';
  if (page != null) {
    query += `page=${page}`;
  }
  if (size != null) {
    query += `${query ? '&' : ''}size=${size}`;
  }
  if (query) {
    query = '?' + query;
  }

  return await authRequest('GET', `/users/notifications${query}`);
};

export const getClientNotificationsCount = async () => {
  return await authRequest('GET', '/users/notifications/count');
};

/** Header badge: same `/users/notifications/count` as list total; synced via user store. */
export const getUnreadNotificationsCount = async () => {
  return await getClientNotificationsCount();
};


export const markAllClientNotificationsAsRead = async () => {
  return await authRequest('PATCH', '/users/notifications/read/all', {});
};

export const markClientNotificationAsRead = async (notificationId: number) => {
  return await authRequest('PATCH', `/users/notifications/read/${notificationId}`, {});
}
