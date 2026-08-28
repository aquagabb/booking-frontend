import { authRequest, request } from '../request';

export const getGeneralData = async () => {
    const response = await request('GET', '/others/general');
    return response;
};


export const uploadFile = async (body) => {
    const response = await authRequest('POST', '/files/image', body, 'multipart');
    return response;
};

export const getAdminMetrics = async () => {
    const response = await authRequest('GET', '/others/metrics');
    return response;
};

export const getReminders = async () => {
    const response = await authRequest('GET', '/others/reminders');
    return response;
};

export const createReminder = async (body: {
    type: 'general' | 'booking' | 'location';
    itemId?: number | string | null;
    description: string;
    remindAt: string;
}) => {
    const response = await authRequest('POST', '/others/reminders', body);
    return response;
};

export const updateReminder = async (id: number, body: {
    description: string;
    remindAt: string;
}) => {
    const response = await authRequest('PUT', `/others/reminders/${id}`, body);
    return response;
};

export const deleteReminder = async (id: number) => {
    const response = await authRequest('DELETE', `/others/reminders/${id}`);
    return response;
};