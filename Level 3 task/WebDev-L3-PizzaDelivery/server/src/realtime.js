import { Server } from 'socket.io';
import { env } from './config/env.js';
import { store } from './db/index.js';
import { verifyToken } from './utils/security.js';

let io = null;
const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);
const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOrigin = (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (!env.isProduction && localDevOrigin.test(origin))) {
        callback(null, true);
        return;
    }

    callback(null, false);
};

export const initRealtime = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                next(new Error('Unauthorized'));
                return;
            }

            const payload = verifyToken(token);

            if (payload.role === 'admin') {
                const admin = await store.admins.findById(payload.sub);
                if (!admin) {
                    next(new Error('Unauthorized'));
                    return;
                }
                socket.data = { role: 'admin', id: admin.id, name: admin.name };
                socket.join('admins');
                next();
                return;
            }

            if (payload.role === 'user') {
                const user = await store.users.findById(payload.sub);
                if (!user || !user.isVerified) {
                    next(new Error('Unauthorized'));
                    return;
                }
                socket.data = { role: 'user', id: user.id, name: user.name };
                socket.join(`user:${user.id}`);
                next();
                return;
            }

            next(new Error('Unauthorized'));
        } catch (error) {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.emit('connected', {
            role: socket.data.role,
            id: socket.data.id
        });
    });

    return io;
};

export const emitToUser = (userId, event, payload) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, payload);
    }
};

export const emitToAdmins = (event, payload) => {
    if (io) {
        io.to('admins').emit(event, payload);
    }
};
