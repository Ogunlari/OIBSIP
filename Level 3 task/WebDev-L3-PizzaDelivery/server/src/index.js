import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import http from 'node:http';
import morgan from 'morgan';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { storageMode, store } from './db/index.js';
import { startJobs } from './jobs.js';
import { errorHandler, notFound } from './middleware/error.js';
import { initRealtime } from './realtime.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import { hashPassword } from './utils/security.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../../client/dist');
const allowedOrigins = env.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);
const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOrigin = (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (!env.isProduction && localDevOrigin.test(origin))) {
        callback(null, true);
        return;
    }

    callback(null, false);
};

const createApp = () => {
    const app = express();

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));
    app.use(cors({
        origin: corsOrigin,
        credentials: true
    }));
    app.use(express.json({ limit: '100kb' }));
    app.use(morgan('dev'));

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 60,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMITED'
        }
    });

    app.get('/api/health', (request, response) => {
        response.json({
            status: 'ok',
            storageMode,
            paymentMode: env.paymentMode,
            emailMode: env.emailMode,
            timestamp: new Date().toISOString()
        });
    });

    app.use('/api/auth', authLimiter, authRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin/auth/login', authLimiter);
    app.use('/api/admin', adminRoutes);
    app.use('/api', notFound);

    if (fs.existsSync(clientDist)) {
        app.use(express.static(clientDist));
        app.get('*', (request, response) => {
            response.sendFile(path.join(clientDist, 'index.html'));
        });
    } else {
        app.use(notFound);
    }

    app.use(errorHandler);

    return app;
};

const start = async () => {
    await store.init();

    await store.admins.ensure({
        name: env.admin.name,
        email: env.admin.email,
        passwordHash: await hashPassword(env.admin.password)
    });

    const app = createApp();
    const server = http.createServer(app);

    initRealtime(server);

    server.listen(env.port, () => {
        const paymentSummary = env.paymentMode === 'razorpay'
            ? 'Razorpay'
            : env.paymentMode === 'mock'
                ? 'DEMO (mock payments, development only)'
                : 'NOT CONFIGURED - set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET';

        console.log(`SliceCraft API running on http://localhost:${env.port}`);
        console.log(`Storage: ${storageMode}`);
        console.log(`Payments: ${paymentSummary}`);
        console.log(`Email: ${env.emailMode === 'smtp' ? 'SMTP' : 'Ethereal test SMTP'}`);
        console.log(`Admin login: ${env.admin.email}`);
    });

    startJobs();

    const shutdown = async () => {
        server.close(async () => {
            await store.close();
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

start().catch((error) => {
    console.error('Failed to start SliceCraft:', error);
    process.exit(1);
});
