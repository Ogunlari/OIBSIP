import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const mongoUri = (process.env.MONGODB_URI || '').trim();

if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Set it in server/.env (for example mongodb://127.0.0.1:27017/sliceraft).');
}

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production.');
}

const numberFromEnv = (name, fallback) => {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
};

const booleanFromEnv = (name, fallback = false) => {
    const value = process.env[name];
    if (value === undefined) {
        return fallback;
    }
    return value === 'true' || value === '1';
};

const smtpHost = process.env.SMTP_HOST || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpEnabled = Boolean(smtpHost && smtpUser && smtpPass);

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpayEnabled = Boolean(razorpayKeyId && razorpayKeySecret);
const mockPaymentsEnabled = !isProduction && !razorpayEnabled;
const paymentMode = razorpayEnabled ? 'razorpay' : mockPaymentsEnabled ? 'mock' : 'not_configured';

if (isProduction && !razorpayEnabled) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in production.');
}

if (isProduction && !smtpEnabled) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required in production.');
}

export const env = {
    nodeEnv,
    isProduction,
    port: numberFromEnv('PORT', 5000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'dev-only-sliceraft-secret-change-before-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    mongoUri,
    admin: {
        name: process.env.ADMIN_NAME || 'Store Admin',
        email: (process.env.ADMIN_EMAIL || 'admin@sliceraft.local').toLowerCase(),
        password: process.env.ADMIN_PASSWORD || 'Admin@12345',
        alertEmail: (process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL || 'admin@sliceraft.local').toLowerCase()
    },
    smtp: {
        host: smtpHost,
        port: numberFromEnv('SMTP_PORT', 587),
        secure: booleanFromEnv('SMTP_SECURE', false),
        user: smtpUser,
        pass: smtpPass,
        from: process.env.SMTP_FROM || 'SliceCraft <no-reply@sliceraft.local>',
        enabled: smtpEnabled
    },
    emailMode: smtpEnabled ? 'smtp' : 'ethereal',
    razorpay: {
        keyId: razorpayKeyId,
        keySecret: razorpayKeySecret,
        enabled: razorpayEnabled
    },
    mockPaymentsEnabled,
    paymentMode,
    taxRate: 0.05,
    deliveryFee: 49,
    currency: 'INR',
    verificationTokenTtlHours: 24,
    passwordResetTokenTtlMinutes: numberFromEnv('PASSWORD_RESET_TTL_MINUTES', 60),
    lowStockCooldownMinutes: numberFromEnv('LOW_STOCK_COOLDOWN_MINUTES', 360),
    pendingOrderTtlMinutes: numberFromEnv('PENDING_ORDER_TTL_MINUTES', 20)
};
