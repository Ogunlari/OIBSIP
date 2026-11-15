import { AppError } from '../utils/errors.js';

export const validate = (schema) => (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
        next(new AppError(
            'Validation failed.',
            422,
            'VALIDATION_ERROR',
            result.error.flatten()
        ));
        return;
    }

    request.body = result.data;
    next();
};
