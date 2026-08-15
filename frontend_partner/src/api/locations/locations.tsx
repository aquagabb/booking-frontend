import { authRequest, request } from '../request';


export const searchLocations = async (term, filters = {}) => {
  const params = new URLSearchParams({
    term, 
    ...filters
  });

  const response = await authRequest('GET', `/locations/search?${params.toString()}`);
  return response;
};


export const searchLocationsSuggestions = async (term) => {
    const params = new URLSearchParams({
      term
    });
    const response = await authRequest('GET', `/locations/search/suggestions?${params.toString()}`);
    return response;
}

export const getHomePageLocations = async () => {
    const response = await request('GET', `/locations/homepage`);
    return response;
}

export const getLocations = async () => {
    const response = await authRequest('GET', `/locations`);
    return response;
}

export const getLocationById = async (id) => {
    const response = await authRequest('GET', `/locations/${id}`);
    return response;
};

export const updateLocationPricing = async (body) => {
    const response = await authRequest('POST', `/locations/update_pricing`, body);
    return response;
}

export const getLocationBySlug = async (slug) => {
    const response = await request('GET', `/locations/${slug}/details`);
    return response;
};

export const updateLocation = async (body) => {
    const response = await authRequest('POST', `/locations`, body);
    return response;
}

export const getLocationPhotos = async (id) => {
    const response = await authRequest('GET', `/locations/${id}/photos`);
    return response;
}

export const uploadFile = async (id, body) => {
    const response = await authRequest('POST', `/locations/${id}/photos`, body, 'multipart');
    return response;
};

export const updatePhotoDetails = async (id, body, photoId) => {
    const response = await authRequest('POST', `/locations/${id}/photos/${photoId}`, body);
    return response;
}

export const updatePhotoCategory = async (id, body) => {
    const response = await authRequest('POST', `/locations/${id}/photos/categories`, body);
    return response;
}

export const deletePhotoCategory = async (id, categoryId) => {
    const response = await authRequest('DELETE', `/locations/${id}/photos/categories/${categoryId}`, {});
    return response;
}

export const deletePhoto = async (id, photoId) => {
    const response = await authRequest('DELETE', `/locations/${id}/photos/${photoId}`, {});
    return response;
}

export const checkIsFavoriteLocation = async (locationId) => {
    const response = await authRequest('GET', `/locations/favorites/${locationId}`);
    return response;
}

export const getLocationFavorites = async () => {
    const response = await authRequest('GET', `/locations/favorites`);
    return response;
}

export const addLocationToFavorite = async (locationId) => {
    const response = await authRequest('POST', `/locations/favorites/${locationId}`, {});
    return response;
}

export const removeLocationFavorite = async (locationId) => {
    const response = await authRequest('DELETE', `/locations/favorites/${locationId}`, {});
    return response;
}

