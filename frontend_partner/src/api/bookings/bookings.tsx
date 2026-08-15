import { authRequest, request } from '../request';

export const getBookings = async (queryParams: any) => {
    const params = new URLSearchParams({
        ...queryParams
    });
    const response = await authRequest('GET', `/bookings?${params.toString()}`);
    return response;
}

export const getBookingMetadata = async () => {
    const response = await authRequest('GET', `/bookings/metadata`);
    return response;
}

export const getBookingById = async (id, queryParams, isLogged) => {
    const params = new URLSearchParams({
        ...queryParams
    });

    const response = isLogged ? await authRequest('GET', `/bookings/${id}?${params.toString()}`) : await request('GET', `/bookings/public/${id}?${params.toString()}`);
    return response;
};

export const getBlockedDates = async (locationId) => {
    const response = await authRequest('GET', `/bookings/blocked?locationId=${locationId}`);
    return response;
}

export const createBlockedDate = async (body: {
    locationId: number;
    checkIn: string;
    checkOut: string;
    reason?: string;
}) => {
    const response = await authRequest('POST', `/bookings/blocked`, body);
    return response;
}

export const deleteBlockedDate = async (body: {
    id: number;
    locationId: number;
}) => {
    const response = await authRequest('POST', `/bookings/blocked/delete`, body);
    return response;
}

export const getAvailabilityRules = async (locationId: number) => {
    const response = await authRequest('GET', `/bookings/availability/rules?locationId=${locationId}`);
    return response;
}


export const updateBooking = async (id, body) => {
    const response = await authRequest('PUT', `/bookings/${id}`, body);
    return response;
}

export const updateBookingStatus = async (body: { status: string, bookingId: number }) => {
    const response = await authRequest('POST', `/bookings/update_status`, body);
    return response;
}

export const createBooking = async (body) => {
    const response = await authRequest('POST', `/bookings`, body);
    return response;
}

export const getBookingNotes = async (bookingId) => {
    const response = await authRequest('GET', `/bookings/${bookingId}/notes`);
    return response;
}

export const createUpdateBookingNote = async(body) => {
    const response = await authRequest('POST', `/bookings/notes`, body);
    return response;
}

export const checkoutBooking = async (body) => {
    const response = await authRequest('POST', `/bookings/checkout`, body);
    return response;
}

export const deleteBookingNote = async (noteId) => {
    const response = await authRequest('DELETE', `/bookings/notes/${noteId}`);
    return response;
}

export const cancelBooking = async (body: {
    bookingCode: string;
    reason: string;
}) => {
    const response = await authRequest('POST', `/bookings/cancel`, body);
    return response;
}

export const updateBookingDates = async (body: {
    checkIn: string;
    checkOut: string;
    bookingCode: string;
}) => {
    const response = await authRequest('POST', `/bookings/change-dates`, body);
    return response;
}

export const requestBookingModifications = async (body: {
    bookingCode: string;
    guests?: number;
    categoryId?: number;
}) => {
    const response = await authRequest('POST', `/bookings/request_modifications`, body);
    return response;
}

export const getAvailableTimeSlots = async (queryParams: any) => {
    // const params = new URLSearchParams({
    //     ...queryParams
    // });
    // const response = await authRequest('GET', `/bookings/available-time-slots?${params.toString()}`);
    // return response;
}

export const uploadBookingAttachment = async (bookingId: string, body: any) => {
    const response = await authRequest('POST', `/bookings/attachments`, body, 'multipart');
    return response;
}


export const deleteBookingAttachment = async (bookingId: string, attachmentId: string) => {
    const response = await authRequest('DELETE', `/bookings/${bookingId}/attachments/${attachmentId}`);
    return response;
}

export const getBookingAttachments = async (bookingId: string) => {
    const response = await authRequest('GET', `/bookings/attachments?bookingId=${bookingId}`);
    return response;
}

export const getBookingPayments = async (bookingId: string) => {
    const response = await authRequest('GET', `/bookings/${bookingId}/payments`);
    return response;
}

export const createAdvancePayment = async (body: {
    bookingId: number;
    amount: number;
    date: string;
    notes?: string;
}) => {
    const response = await authRequest('POST', `/bookings/payments`, body);
    return response;
}

export const deleteAdvancePayment = async (paymentId: number) => {
    const response = await authRequest('DELETE', `/bookings/payments/${paymentId}`);
    return response;
}