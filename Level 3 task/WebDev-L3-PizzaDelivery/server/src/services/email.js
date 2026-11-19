import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: env.currency,
    maximumFractionDigits: 0
});

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

let transportPromise = null;

const getTransport = () => {
    if (transportPromise) {
        return transportPromise;
    }

    transportPromise = (async () => {
        if (env.smtp.enabled) {
            const transporter = nodemailer.createTransport({
                host: env.smtp.host,
                port: env.smtp.port,
                secure: env.smtp.secure,
                auth: {
                    user: env.smtp.user,
                    pass: env.smtp.pass
                }
            });

            return {
                transporter,
                mode: 'smtp',
                from: env.smtp.from
            };
        }

        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log(`[email] Using Ethereal test SMTP account: ${testAccount.user}`);
        console.log('[email] View delivered messages at https://ethereal.email/messages');
        console.warn('[email] Ethereal is a development-only test inbox; configure SMTP_* for verified delivery.');

        return {
            transporter,
            mode: 'ethereal',
            from: `SliceCraft <${testAccount.user}>`
        };
    })().catch((error) => {
        transportPromise = null;
        throw error;
    });

    return transportPromise;
};

const sendMail = async ({ to, subject, text, html }) => {
    const { transporter, mode, from } = await getTransport();
    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });

    const previewUrl = mode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
        console.log(`[email] Preview delivered message: ${previewUrl}`);
    }

    return { mode, previewUrl };
};

export const sendVerificationEmail = async (user, verificationUrl) => {
    const subject = 'Verify your SliceCraft account';
    const text = `Hi ${user.name},\n\nVerify your SliceCraft account by opening this link:\n${verificationUrl}\n\nThis link expires in ${env.verificationTokenTtlHours} hours.`;
    const html = `
        <div style="font-family:Arial,sans-serif;color:#2B2118;line-height:1.6">
            <h2 style="color:#D9381E">Welcome to SliceCraft</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>Verify your account to start ordering.</p>
            <p><a href="${verificationUrl}" style="display:inline-block;background:#D9381E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verify email</a></p>
            <p>This link expires in ${env.verificationTokenTtlHours} hours.</p>
        </div>
    `;

    return sendMail({ to: user.email, subject, text, html });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
    const subject = 'Reset your SliceCraft password';
    const text = `Hi ${user.name},\n\nWe received a request to reset your SliceCraft password. Open this link to choose a new one:\n${resetUrl}\n\nThis link expires in ${env.passwordResetTokenTtlMinutes} minutes. If you did not request a reset, you can ignore this email.`;
    const html = `
        <div style="font-family:Arial,sans-serif;color:#2B2118;line-height:1.6">
            <h2 style="color:#D9381E">Reset your password</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>We received a request to reset your SliceCraft password.</p>
            <p><a href="${resetUrl}" style="display:inline-block;background:#D9381E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Choose a new password</a></p>
            <p>This link expires in ${env.passwordResetTokenTtlMinutes} minutes. If you did not request a reset, you can ignore this email.</p>
        </div>
    `;

    return sendMail({ to: user.email, subject, text, html });
};

export const sendLowStockAlert = async (items) => {
    const subject = `Low stock alert: ${items.length} item${items.length === 1 ? '' : 's'} need attention`;
    const lines = items.map((item) => (
        `${item.name} (${item.category}): ${item.stock} left, threshold ${item.threshold}`
    ));
    const rows = items.map((item) => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #EADCCB">${escapeHtml(item.name)}</td>
            <td style="padding:8px;border-bottom:1px solid #EADCCB;text-transform:capitalize">${escapeHtml(item.category)}</td>
            <td style="padding:8px;border-bottom:1px solid #EADCCB;color:#B92E16;font-weight:bold">${item.stock}</td>
            <td style="padding:8px;border-bottom:1px solid #EADCCB">${item.threshold}</td>
        </tr>
    `).join('');

    const text = `Low stock alert\n\n${lines.join('\n')}`;
    const html = `
        <div style="font-family:Arial,sans-serif;color:#2B2118;line-height:1.6">
            <h2 style="color:#B92E16">Low stock alert</h2>
            <p>The following inventory items are at or below their threshold.</p>
            <table style="border-collapse:collapse;width:100%;max-width:560px">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px;border-bottom:2px solid #EADCCB">Item</th>
                        <th style="text-align:left;padding:8px;border-bottom:2px solid #EADCCB">Category</th>
                        <th style="text-align:left;padding:8px;border-bottom:2px solid #EADCCB">Stock</th>
                        <th style="text-align:left;padding:8px;border-bottom:2px solid #EADCCB">Threshold</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;

    return sendMail({ to: env.admin.alertEmail, subject, text, html });
};

export const sendOrderConfirmation = async (order, user) => {
    const subject = `Order confirmed: ${order.id.slice(0, 8).toUpperCase()}`;
    const itemLines = order.items.map((item) => (
        `${item.quantity} x ${item.name} - ${currencyFormatter.format(item.lineTotal)}`
    ));
    const text = `Hi ${user.name},\n\nYour order is confirmed.\n\n${itemLines.join('\n')}\n\nTotal: ${currencyFormatter.format(order.totalAmount)}\n\nTrack your order in your SliceCraft account.`;
    const html = `
        <div style="font-family:Arial,sans-serif;color:#2B2118;line-height:1.6">
            <h2 style="color:#D9381E">Order confirmed</h2>
            <p>Hi ${escapeHtml(user.name)},</p>
            <p>Your order <strong>${order.id.slice(0, 8).toUpperCase()}</strong> is confirmed.</p>
            <ul>${order.items.map((item) => `<li>${item.quantity} x ${escapeHtml(item.name)} - ${currencyFormatter.format(item.lineTotal)}</li>`).join('')}</ul>
            <p><strong>Total: ${currencyFormatter.format(order.totalAmount)}</strong></p>
            <p>Track your order in your SliceCraft account.</p>
        </div>
    `;

    return sendMail({ to: user.email, subject, text, html });
};
