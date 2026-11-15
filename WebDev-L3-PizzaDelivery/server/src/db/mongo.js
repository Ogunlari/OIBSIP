import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { seedInventory, seedPizzas } from './seedData.js';
import { Admin, InventoryItem, Order, Pizza, User } from './models.js';
import { AppError } from '../utils/errors.js';
import { newId } from '../utils/security.js';

export const storageMode = 'mongodb';

export const init = async () => {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });

    for (const item of seedInventory) {
        await InventoryItem.updateOne(
            { id: item.id },
            { $setOnInsert: { ...item, lastLowStockAlertAt: null } },
            { upsert: true }
        );
    }

    for (const pizza of seedPizzas) {
        await Pizza.updateOne(
            { id: pizza.id },
            { $setOnInsert: pizza },
            { upsert: true }
        );
    }
};

export const close = async () => {
    await mongoose.disconnect();
};

export const users = {
    async findByEmail(email) {
        return User.findOne({ email: email.toLowerCase() }).lean();
    },
    async findById(id) {
        return User.findOne({ id }).lean();
    },
    async create(data) {
        const document = await User.create({
            ...data,
            id: newId(),
            email: data.email.toLowerCase(),
            isVerified: Boolean(data.isVerified)
        });
        return document.toObject();
    },
    async verifyByToken(tokenHash, now) {
        return User.findOneAndUpdate(
            {
                verificationTokenHash: tokenHash,
                verificationTokenExpires: { $gt: now }
            },
            {
                $set: { isVerified: true },
                $unset: { verificationTokenHash: '', verificationTokenExpires: '' }
            },
            { new: true }
        ).lean();
    },
    async setResetToken(id, tokenHash, expiresAt) {
        return User.findOneAndUpdate(
            { id },
            { $set: { resetTokenHash: tokenHash, resetTokenExpires: expiresAt } },
            { new: true }
        ).lean();
    },
    async resetByToken(tokenHash, passwordHash, now) {
        return User.findOneAndUpdate(
            {
                resetTokenHash: tokenHash,
                resetTokenExpires: { $gt: now }
            },
            {
                $set: { passwordHash },
                $unset: { resetTokenHash: '', resetTokenExpires: '' }
            },
            { new: true }
        ).lean();
    }
};

export const admins = {
    async findByEmail(email) {
        return Admin.findOne({ email: email.toLowerCase() }).lean();
    },
    async findById(id) {
        return Admin.findOne({ id }).lean();
    },
    async ensure(data) {
        const existing = await Admin.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            existing.name = data.name;
            existing.passwordHash = data.passwordHash;
            await existing.save();
            return existing.toObject();
        }

        const document = await Admin.create({
            id: newId(),
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash
        });
        return document.toObject();
    }
};

export const inventory = {
    async list() {
        return InventoryItem.find().sort({ category: 1, name: 1 }).lean();
    },
    async findById(id) {
        return InventoryItem.findOne({ id }).lean();
    },
    async decrement(requirements) {
        const applied = [];

        for (const requirement of requirements) {
            const updated = await InventoryItem.findOneAndUpdate(
                { id: requirement.itemId, stock: { $gte: requirement.quantity } },
                { $inc: { stock: -requirement.quantity } },
                { new: true }
            ).lean();

            if (!updated) {
                for (const item of applied) {
                    await InventoryItem.updateOne(
                        { id: item.itemId },
                        { $inc: { stock: item.quantity } }
                    );
                }

                const current = await InventoryItem.findOne({ id: requirement.itemId }).lean();
                throw new AppError(
                    `Not enough stock for ${current ? current.name : 'an inventory item'}.`,
                    409,
                    'INSUFFICIENT_STOCK',
                    {
                        itemId: requirement.itemId,
                        available: current ? current.stock : 0,
                        requested: requirement.quantity
                    }
                );
            }

            applied.push(requirement);
        }
    },
    async restore(requirements) {
        for (const requirement of requirements) {
            await InventoryItem.updateOne(
                { id: requirement.itemId },
                { $inc: { stock: requirement.quantity } }
            );
        }
    },
    async update(id, patch) {
        const update = {};
        if (patch.stock !== undefined) {
            update.stock = patch.stock;
        }
        if (patch.threshold !== undefined) {
            update.threshold = patch.threshold;
        }
        return InventoryItem.findOneAndUpdate(
            { id },
            { $set: update },
            { new: true }
        ).lean();
    },
    async lowStock() {
        return InventoryItem.find({
            $expr: { $lte: ['$stock', '$threshold'] }
        }).sort({ category: 1, name: 1 }).lean();
    },
    async markAlerted(ids, at) {
        await InventoryItem.updateMany(
            { id: { $in: ids } },
            { $set: { lastLowStockAlertAt: at } }
        );
    }
};

export const pizzas = {
    async list() {
        return Pizza.find().sort({ price: 1 }).lean();
    },
    async findById(id) {
        return Pizza.findOne({ id }).lean();
    }
};

export const orders = {
    async create(data) {
        const status = data.status || 'PENDING_PAYMENT';
        const document = await Order.create({
            ...data,
            id: newId(),
            status,
            paymentStatus: data.paymentStatus || 'PENDING',
            paymentProvider: data.paymentProvider || null,
            paymentOrderId: data.paymentOrderId || null,
            paymentId: data.paymentId || null,
            paidAt: data.paidAt || null,
            statusHistory: data.statusHistory || [{ status, at: new Date() }]
        });
        return document.toObject();
    },
    async findById(id) {
        return Order.findOne({ id }).lean();
    },
    async findByUser(userId) {
        return Order.find({ userId }).sort({ createdAt: -1 }).lean();
    },
    async findAll() {
        return Order.find().sort({ createdAt: -1 }).lean();
    },
    async markPaid(id, userId, paymentId) {
        return Order.findOneAndUpdate(
            { id, userId, status: 'PENDING_PAYMENT' },
            {
                $set: {
                    status: 'RECEIVED',
                    paymentStatus: 'PAID',
                    paymentId,
                    paidAt: new Date()
                },
                $push: {
                    statusHistory: { status: 'RECEIVED', at: new Date() }
                }
            },
            { new: true }
        ).lean();
    },
    async cancelPending(id, userId = null) {
        const filter = { id, status: 'PENDING_PAYMENT' };
        if (userId) {
            filter.userId = userId;
        }

        return Order.findOneAndUpdate(
            filter,
            {
                $set: {
                    status: 'CANCELLED',
                    paymentStatus: 'CANCELLED'
                },
                $push: {
                    statusHistory: { status: 'CANCELLED', at: new Date() }
                }
            },
            { new: true }
        ).lean();
    },
    async update(id, patch) {
        const existing = await Order.findOne({ id }).lean();
        if (!existing) {
            return null;
        }

        const update = { $set: { ...patch } };
        if (patch.status && patch.status !== existing.status) {
            update.$push = { statusHistory: { status: patch.status, at: new Date() } };
        }

        return Order.findOneAndUpdate({ id }, update, { new: true }).lean();
    },
    async findStalePending(before) {
        return Order.find({
            status: 'PENDING_PAYMENT',
            createdAt: { $lt: before }
        }).lean();
    },
    async stats() {
        const statusRows = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = statusRows.reduce((result, row) => {
            result[row._id] = row.count;
            return result;
        }, {});

        const revenueRows = await Order.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            total: statusRows.reduce((total, row) => total + row.count, 0),
            pending: counts.PENDING_PAYMENT || 0,
            received: counts.RECEIVED || 0,
            inKitchen: counts.IN_KITCHEN || 0,
            outForDelivery: counts.OUT_FOR_DELIVERY || 0,
            delivered: counts.DELIVERED || 0,
            cancelled: counts.CANCELLED || 0,
            active: (counts.RECEIVED || 0) + (counts.IN_KITCHEN || 0) + (counts.OUT_FOR_DELIVERY || 0),
            revenue: revenueRows[0] ? revenueRows[0].total : 0
        };
    }
};
