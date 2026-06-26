import { authRequest, request } from '../request';

export const createMessage = async (body) => {
    const response = await authRequest('POST', `/chat/messages`, body);
    return response;
}

export const getMessages = async (conversationId) => {
    const response = await authRequest('GET', `/chat/conversations/${conversationId}`);
    return response;
};

export const getConversations = async (isCustomer = true) => {
    const response = await authRequest('GET', `/chat/conversations?isCustomer=${isCustomer}`);
    return response;
};
