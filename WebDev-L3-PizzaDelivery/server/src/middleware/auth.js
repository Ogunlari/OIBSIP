import { store } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { verifyToken } from '../utils/security.js';

const getBearerToken = (request) => {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
        return null;
    }
    return header.slice(7);
};

export const authUser = async (request, response, next) => {
    try {
        const token = getBearerToken(request);
        if (!token) {
            throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
        }

        const payload = verifyToken(token);
        if (payload.role !== 'user') {
            throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
        }

        const user = await store.users.findById(payload.sub);
        if (!user || !user.isVerified) {
            throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
        }

        request.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }
};

export const authAdmin = async (request, response, next) => {
    try {
        const token = getBearerToken(request);
        if (!token) {
            throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
        }

        const payload = verifyToken(token);
        if (payload.role !== 'admin') {
            throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
        }

        const admin = await store.admins.findById(payload.sub);
        if (!admin) {
            throw new AppError('Admin authentication required.', 401, 'UNAUTHORIZED');
        }

        request.admin = admin;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError('Admin authentication required.', 401, 'UNAUTHORIZED'));
    }
};
