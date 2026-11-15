const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status, code, details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

const parseBody = async (response) => {
    const text = await response.text();
    if (!text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
};

export const apiFetch = async (path, { method = 'GET', token, body } = {}) => {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new ApiError('Unable to reach the server. Is the API running?', 0, 'NETWORK_ERROR');
    }

    const data = await parseBody(response);

    if (!response.ok) {
        throw new ApiError(
            data.message || 'The request could not be completed.',
            response.status,
            data.code,
            data.details
        );
    }

    return data;
};

export const getSocketUrl = () => SOCKET_URL;
