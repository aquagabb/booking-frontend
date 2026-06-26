import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const createApiInstance = (headers) => {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
};

const apiWithToken = createApiInstance({
});

apiWithToken.interceptors.request.use(
    config => {
        const userObject = localStorage.getItem('user-storage');
        if (userObject) {
            const parsed = JSON.parse(userObject);
            const token = parsed?.state?.user?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    error => {
        return error
    }
);

apiWithToken.interceptors.response.use(
    response => {

        return {
            environment: {
                status: response.status,
            },
            response: response.data,
            status: response.status
        }

    },
    error => {
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized access. Redirect to login page or show a modal.');
            localStorage.setItem('user-storage', null);
            window.location.href = '/login';
        }

        if (error.response && error.response.status === 403) {
            console.log('Access denied. Redirect to forbidden page or show an access denied message.');
            localStorage.setItem('user-storage', null);
            window.location.href = '/login';
        }

        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
            console.log("Not found or bad request.");
            return {
                environment: {
                    status: error.response.status,
                },
                response: error.response.data,
                status: error.response.status
            }
        }

        console.log("An error occurred:", error);

        return error
    }
);

const apiWithoutToken = createApiInstance({
});

apiWithoutToken.interceptors.response.use(
    response => {
        return {
            environment: {
                status: response.status,
            },
            response: response.data,
            status: response.status
        }
    },
    error => {
        console.error('An error occurred:', error);

        if (error.response && error.response.data) {
            return {
                environment: {
                    status: error.response.status,
                },
                response: error.response.data,
                status: error.response.status
            }
        }

        return Promise.reject('An unexpected error occurred.');
    }
);

export { apiWithToken, apiWithoutToken };
