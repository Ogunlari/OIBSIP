import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const razorpay = env.razorpay.enabled
    ? new Razorpay({
        key_id: env.razorpay.keyId,
        key_secret: env.razorpay.keySecret
    })
    : null;

export const createPaymentOrder = async (order) => {
    if (!razorpay) {
        if (env.isProduction) {
            throw new AppError('Payment provider is not configured.', 503, 'PAYMENT_NOT_CONFIGURED');
        }
        return {
            provider: 'mock',
            mockOrderId: `mock_${order.id}`,
            amount: order.totalAmount,
            currency: env.currency
        };
    }

    try {
        const paymentOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: env.currency,
            receipt: order.id,
            notes: {
                orderId: order.id
            }
        });

        return {
            provider: 'razorpay',
            keyId: env.razorpay.keyId,
            razorpayOrderId: paymentOrder.id,
            amount: order.totalAmount,
            currency: env.currency
        };
    } catch (error) {
        console.error(error);
        throw new AppError('Unable to create the payment order.', 502, 'PAYMENT_CREATE_FAILED');
    }
};

export const verifyPayment = (order, payload) => {
    if (order.paymentProvider === 'mock') {
        if (env.isProduction) {
            throw new AppError('Mock payments are disabled in production.', 400, 'PAYMENT_VERIFICATION_FAILED');
        }
        return { paymentId: `mock_pay_${order.id}` };
    }

    if (!razorpay) {
        throw new AppError('Payment provider is not configured.', 503, 'PAYMENT_NOT_CONFIGURED');
    }

    const { razorpayPaymentId, razorpaySignature } = payload;
    if (!razorpayPaymentId || !razorpaySignature) {
        throw new AppError('Payment verification details are missing.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    const expectedSignature = crypto
        .createHmac('sha256', env.razorpay.keySecret)
        .update(`${order.paymentOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (expectedSignature !== razorpaySignature) {
        throw new AppError('Payment signature verification failed.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    return { paymentId: razorpayPaymentId };
};
