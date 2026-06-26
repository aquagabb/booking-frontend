import { authRequest, request } from '../request';

export const getGeneralData = async () => {
    const response = await request('GET', '/others/general');
    return response;
};

