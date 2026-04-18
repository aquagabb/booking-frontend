import { apiWithToken, apiWithoutToken } from './api';


const makeRequest = async (apiInstance, method, endpoint, data = null, type = 'application/json') => {

  const headers = {
    'Content-Type': type === 'multipart' ? 'multipart/form-data' : 'application/json',
  };

  const config: any = {
    method,
    url: endpoint,
    headers
  };

  // Only include data if it's provided (not null/undefined)
  // This is important for DELETE requests which shouldn't have a body
  if (data !== null && data !== undefined) {
    config.data = data;
  }

  const response = await apiInstance(config);

  return response;
};

export const request = async (method, endpoint, data = null) => {
  return await makeRequest(apiWithoutToken, method, endpoint, data);
};

export const authRequest = async (method, endpoint, data = null, type) => {
  return await makeRequest(apiWithToken, method, endpoint, data, type);
};
