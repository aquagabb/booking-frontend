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