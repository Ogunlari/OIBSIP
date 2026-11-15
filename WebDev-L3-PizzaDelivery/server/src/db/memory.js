import { seedInventory, seedPizzas } from './seedData.js';
import { AppError } from '../utils/errors.js';
import { newId } from '../utils/security.js';

const database = {
    users: [],
    admins: [],
    inventory: [],
    pizzas: [],
    orders: []
};

const clone = (value) => structuredClone(value);

const withTimestamps = (item) => ({
    ...clone(item),
    lastLowStockAlertAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
});

export const storageMode = 'memory';

export const init = async () => {
    if (database.inventory.length === 0) {
        database.inventory = seedInventory.map(withTimestamps);
    }
    if (database.pizzas.length === 0) {
        database.pizzas = seedPizzas.map((pizza) => ({
            ...clone(pizza),
            createdAt: new Date(),
            updatedAt: new Date()
        }));
    }
};

export const close = async () => {};

export const users = {
    async findByEmail(email) {
        const user = database.users.find((entry) => entry.email === email.toLowerCase());
        return user ? clone(user) : null;
    },
    async findById(id) {
        const user = database.users.find((entry) => entry.id === id);
        return user ? clone(user) : null;
    },
    async create(data) {
        const now = new Date();
        const user = {
            ...clone(data),
            id: newId(),
            email: data.email.toLowerCase(),
            isVerified: Boolean(data.isVerified),
            createdAt: now,
            updatedAt: now
        };
        database.users.push(user);
        return clone(user);
    },
    async verifyByToken(tokenHash, now) {
        const user = database.users.find((entry) => (
            entry.verificationTokenHash === tokenHash
            && entry.verificationTokenExpires
            && new Date(entry.verificationTokenExpires).getTime() > now.getTime()
        ));

        if (!user) {
            return null;
        }

        user.isVerified = true;
        user.verificationTokenHash = null;
        user.verificationTokenExpires = null;
        user.updatedAt = new Date();
        return clone(user);
    },
    async setResetToken(id, tokenHash, expiresAt) {
        const user = database.users.find((entry) => entry.id === id);
        if (!user) {
            return null;
        }

        user.resetTokenHash = tokenHash;
        user.resetTokenExpires = expiresAt;
        user.updatedAt = new Date();
        return clone(user);
    },
    async resetByToken(tokenHash, passwordHash, now) {
        const user = database.users.find((entry) => (
            entry.resetTokenHash === tokenHash
            && entry.resetTokenExpires
            && new Date(entry.resetTokenExpires).getTime() > now.getTime()
        ));

        if (!user) {
            return null;
        }

        user.passwordHash = passwordHash;
        user.resetTokenHash = null;
        user.resetTokenExpires = null;
        user.updatedAt = new Date();
        return clone(user);
    }
};

export const admins = {
    async findByEmail(email) {
        const admin = database.admins.find((entry) => entry.email === email.toLowerCase());
        return admin ? clone(admin) : null;
    },
    async findById(id) {
        const admin = database.admins.find((entry) => entry.id === id);
        return admin ? clone(admin) : null;
    },
    async ensure(data) {
        const existing = database.admins.find((entry) => entry.email === data.email.toLowerCase());
        if (existing) {
            existing.name = data.name;
            existing.passwordHash = data.passwordHash;
            existing.updatedAt = new Date();
            return clone(existing);
        }

        const now = new Date();
        const admin = {
            id: newId(),
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            createdAt: now,
            updatedAt: now
        };
        database.admins.push(admin);
        return clone(admin);
    }
};

export const inventory = {
    async list() {
        return clone(database.inventory).sort((a, b) => (
            a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        ));
    },
    async findById(id) {
        const item = database.inventory.find((entry) => entry.id === id);
        return item ? clone(item) : null;
    },
    async decrement(requirements) {
        for (const requirement of requirements) {
            const item = database.inventory.find((entry) => entry.id === requirement.itemId);
            if (!item || item.stock < requirement.quantity) {
                throw new AppError(
                    `Not enough stock for ${item ? item.name : 'an inventory item'}.`,
                    409,
                    'INSUFFICIENT_STOCK',
                    {
                        itemId: requirement.itemId,
                        available: item ? item.stock : 0,
                        requested: requirement.quantity
                    }
                );
            }
        }

        const updatedAt = new Date();
        for (const requirement of requirements) {
            const item = database.inventory.find((entry) => entry.id === requirement.itemId);
            item.stock -= requirement.quantity;
            item.updatedAt = updatedAt;
        }
    },
    async restore(requirements) {
        const updatedAt = new Date();
        for (const requirement of requirements) {
            const item = database.inventory.find((entry) => entry.id === requirement.itemId);
            if (item) {
                item.stock += requirement.quantity;
                item.updatedAt = updatedAt;
            }
        }
    },
    async update(id, patch) {
        const item = database.inventory.find((entry) => entry.id === id);
        if (!item) {
            return null;
        }

        if (patch.stock !== undefined) {
            item.stock = patch.stock;
        }
        if (patch.threshold !== undefined) {
            item.threshold = patch.threshold;
        }
        item.updatedAt = new Date();
        return clone(item);
    },
    async lowStock() {
        return clone(database.inventory).filter((item) => item.stock <= item.threshold);
    },
    async markAlerted(ids, at) {
        for (const item of database.inventory) {
            if (ids.includes(item.id)) {
                item.lastLowStockAlertAt = at;
            }
        }
    }
};

export const pizzas = {
    async list() {
        return clone(database.pizzas).sort((a, b) => a.price - b.price);
    },
    async findById(id) {
        const pizza = database.pizzas.find((entry) => entry.id === id);
        return pizza ? clone(pizza) : null;
    }
};

export const orders = {
    async create(data) {
        const now = new Date();
        const status = data.status || 'PENDING_PAYMENT';
        const order = {
            ...clone(data),
            id: newId(),
            status,
            paymentStatus: data.paymentStatus || 'PENDING',
            paymentProvider: data.paymentProvider || null,
            paymentOrderId: data.paymentOrderId || null,
            paymentId: data.paymentId || null,
            paidAt: data.paidAt || null,
            statusHistory: data.statusHistory || [{ status, at: now }],
            createdAt: now,
            updatedAt: now
        };
        database.orders.push(order);
        return clone(order);
    },
    async findById(id) {
        const order = database.orders.find((entry) => entry.id === id);
        return order ? clone(order) : null;
    },
    async findByUser(userId) {
        return clone(database.orders)
            .filter((order) => order.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async findAll() {
        return clone(database.orders).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async markPaid(id, userId, paymentId) {
        const order = database.orders.find((entry) => (
            entry.id === id
            && entry.userId === userId
            && entry.status === 'PENDING_PAYMENT'
        ));

        if (!order) {
            return null;
        }

        const now = new Date();
        order.status = 'RECEIVED';
        order.paymentStatus = 'PAID';
        order.paymentId = paymentId;
        order.paidAt = now;
        order.updatedAt = now;
        order.statusHistory.push({ status: 'RECEIVED', at: now });
        return clone(order);
    },
    async cancelPending(id, userId = null) {
        const order = database.orders.find((entry) => (
            entry.id === id
            && entry.status === 'PENDING_PAYMENT'
            && (!userId || entry.userId === userId)
        ));

        if (!order) {
            return null;
        }

        const now = new Date();
        order.status = 'CANCELLED';
        order.paymentStatus = 'CANCELLED';
        order.updatedAt = now;
        order.statusHistory.push({ status: 'CANCELLED', at: now });
        return clone(order);
    },
    async update(id, patch) {
        const order = database.orders.find((entry) => entry.id === id);
        if (!order) {
            return null;
        }

        const previousStatus = order.status;
        Object.assign(order, patch, { updatedAt: new Date() });

        if (patch.status && patch.status !== previousStatus) {
            order.statusHistory.push({ status: patch.status, at: new Date() });
        }

        return clone(order);
    },
    async findStalePending(before) {
        return clone(database.orders).filter((order) => (
            order.status === 'PENDING_PAYMENT'
            && new Date(order.createdAt).getTime() < before.getTime()
        ));
    },
    async stats() {
        const counts = database.orders.reduce((result, order) => {
            result[order.status] = (result[order.status] || 0) + 1;
            return result;
        }, {});

        const revenue = database.orders
            .filter((order) => order.paymentStatus === 'PAID')
            .reduce((total, order) => total + order.totalAmount, 0);

        return {
            total: database.orders.length,
            pending: counts.PENDING_PAYMENT || 0,
            received: counts.RECEIVED || 0,
            inKitchen: counts.IN_KITCHEN || 0,
            outForDelivery: counts.OUT_FOR_DELIVERY || 0,
            delivered: counts.DELIVERED || 0,
            cancelled: counts.CANCELLED || 0,
            active: (counts.RECEIVED || 0) + (counts.IN_KITCHEN || 0) + (counts.OUT_FOR_DELIVERY || 0),
            revenue
        };
    }
};
