import { AppError } from '../utils/errors.js';

export const notFound = (request, response, next) => {
    next(new AppError(
        `Route not found: ${request.method} ${request.originalUrl}`,
        404,
        'NOT_FOUND'
    ));
};

export const errorHandler = (error, request, response, next) => {
    const status = error.status || 500;
    const body = {
        message: status >= 500 ? 'Something went wrong.' : error.message,
        code: error.code || 'INTERNAL_ERROR'
    };

    if (error.details) {
        body.details = error.details;
    }

    if (status >= 500) {
        console.error(error);
    }

    response.status(status).json(body);
};
