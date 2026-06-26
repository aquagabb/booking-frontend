import { authRequest } from '../request';

export const getProfile = async () => {
    const response = await authRequest('GET', `/organizations/profile`);
    return response;
}


export const updateProfile = async (body: {
    name: string;
    phone?: string;
    address?: string;
    taxIdentificationNumber?: string;
    registrationNumber?: string;
}) => {
    const response = await authRequest('POST', '/organizations/profile', body);
    return response;
};

export const register = async (body: {
    email: string;
    name: string;
    phone: string;
    address: string;
    countryCode: string;
    taxIdentificationNumber: string;
    registrationNumber: string;
}) => {
    const response = await authRequest('POST', '/organizations/register', body);
    return response;
};

export const updatePreferences = async (body: {
    emailNotifications: boolean;
    messageNotifications: boolean;
    reminderNotifications: boolean;
    marketingNotifications: boolean;
}) => {
    const response = await authRequest('POST', '/organizations/preferences', body);
    return response;
};
