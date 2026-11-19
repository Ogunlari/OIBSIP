import { z } from 'zod';

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72)
    .regex(/[0-9]/, 'Password must contain at least one number.');

const emailSchema = z.string().trim().email('Enter a valid email address.').toLowerCase();

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
    email: emailSchema,
    password: passwordSchema
});

export const forgotPasswordSchema = z.object({
    email: emailSchema
});

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(10, 'Reset token is required.'),
    password: passwordSchema
});

export const loginSchema = z.object({
    email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
    password: z.string().min(1, 'Password is required.')
});

export const verifyEmailSchema = z.object({
    token: z.string().trim().min(10, 'Verification token is required.')
});

export const adminLoginSchema = z.object({
    email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
    password: z.string().min(1, 'Password is required.')
});

const customSelectionsSchema = z.object({
    baseId: z.string().min(1, 'Choose a base.'),
    sauceId: z.string().min(1, 'Choose a sauce.'),
    cheeseId: z.string().min(1, 'Choose a cheese.'),
    veggieIds: z.array(z.string().min(1)).max(5, 'Choose up to 5 veggies.').default([])
});

const checkoutItemSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('pizza'),
        pizzaId: z.string().min(1, 'Pizza is required.'),
        quantity: z.number().int().min(1).max(20)
    }),
    z.object({
        type: z.literal('custom'),
        quantity: z.number().int().min(1).max(20),
        selections: customSelectionsSchema
    })
]);

export const checkoutSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, 'Add at least one item.').max(10)
});

export const verifyPaymentSchema = z.object({
    mock: z.literal(true).optional(),
    razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required.').optional(),
    razorpaySignature: z.string().min(1, 'Razorpay signature is required.').optional()
});

export const inventoryUpdateSchema = z.object({
    stock: z.number().int().min(0).optional(),
    threshold: z.number().int().min(0).optional()
}).refine(
    (data) => data.stock !== undefined || data.threshold !== undefined,
    { message: 'Provide stock or threshold.' }
);

export const orderStatusSchema = z.object({
    status: z.enum(['IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED'])
});
