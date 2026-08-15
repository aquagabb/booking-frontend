import { authRequest, request } from '../request';
import type { SignupBody, LoginBody, GoogleAuthBody, VerifyCodeBody } from './types';

export const login = async (body: LoginBody) => {
    const response = await request('POST', '/users/login', body);
    return response;
};

export const signup = async (body: SignupBody) => {
    const response = await request('POST', '/users/signup', body);
    return response;
};

export const deleteAccount = async () => {
    const response = await authRequest('DELETE', '/users');
    return response;
};

export const updatePassword = async (body: { currentPassword: string; newPassword: string }) => {
    const response = await authRequest('POST', '/users/update-password', body);
    return response;
}

export const updateProfile = async (body: { firstName?: string; lastName?: string; phone?: string }) => {
    const response = await authRequest('POST', '/users/profile', body);
    return response;
};

export const verifyCode = async (body: VerifyCodeBody) => {
    const response = await request('POST', '/users/verify-code', body);
    return response;
};

export const googleAuthentication = async (body: GoogleAuthBody) => {
    const response = await request('POST', '/users/auth/google/callback', body);
    return response;
};

export const createFeedback = async (body: { subject: string, message: string; }) => {
    const response = await authRequest('POST', '/users/feedback', body);
    return response;
}

export const updatePreferences = async (body: { language: string, emailNotifications: boolean }) => {
    const response = await authRequest('POST', '/users/preferences', body);
    return response;
};
