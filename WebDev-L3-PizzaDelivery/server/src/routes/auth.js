import express from 'express';
import { env } from '../config/env.js';
import { store } from '../db/index.js';
import { authUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    comparePassword,
    hashPassword,
    randomToken,
    sha256,
    signToken
} from '../utils/security.js';
import { serializeUser } from '../utils/serializers.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email.js';
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    verifyEmailSchema
} from '../validation/schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(async (request, response) => {
    const { name, email, password } = request.body;
    const existing = await store.users.findByEmail(email);

    if (existing) {
        throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const verificationToken = randomToken();
    const user = await store.users.create({
        name,
        email,
        passwordHash: await hashPassword(password),
        isVerified: false,
        verificationTokenHash: sha256(verificationToken),
        verificationTokenExpires: new Date(Date.now() + env.verificationTokenTtlHours * 60 * 60 * 1000)
    });

    const verificationUrl = `${env.clientUrl}/verify-email?token=${verificationToken}`;
    const mail = await sendVerificationEmail(user, verificationUrl);

    response.status(201).json({
        message: 'Registration successful. Check your email to verify your account.',
        devVerificationUrl: mail.mocked && !env.isProduction ? verificationUrl : undefined
    });
}));

router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(async (request, response) => {
    const user = await store.users.verifyByToken(sha256(request.body.token), new Date());

    if (!user) {
        throw new AppError('This verification link is invalid or has expired.', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    response.json({
        message: 'Email verified. You can now sign in.'
    });
}));

router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (request, response) => {
    const user = await store.users.findByEmail(request.body.email);
    let devResetUrl;

    if (user) {
        const resetToken = randomToken();
        await store.users.setResetToken(
            user.id,
            sha256(resetToken),
            new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000)
        );

        const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
        const mail = await sendPasswordResetEmail(user, resetUrl);

        if (mail.mocked && !env.isProduction) {
            devResetUrl = resetUrl;
        }
    }

    response.json({
        message: 'If an account exists for that email, a password reset link has been sent.',
        devResetUrl
    });
}));

router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (request, response) => {
    const user = await store.users.resetByToken(
        sha256(request.body.token),
        await hashPassword(request.body.password),
        new Date()
    );

    if (!user) {
        throw new AppError('This reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN');
    }

    response.json({
        message: 'Password updated. You can now sign in with your new password.'
    });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (request, response) => {
    const { email, password } = request.body;
    const user = await store.users.findByEmail(email);

    if (!user || !(await comparePassword(password, user.passwordHash))) {
        throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isVerified) {
        throw new AppError('Verify your email before signing in.', 403, 'EMAIL_NOT_VERIFIED');
    }

    const token = signToken({ sub: user.id, role: 'user' });

    response.json({
        token,
        user: serializeUser(user)
    });
}));

router.get('/me', authUser, asyncHandler(async (request, response) => {
    response.json({
        user: serializeUser(request.user)
    });
}));

export default router;
