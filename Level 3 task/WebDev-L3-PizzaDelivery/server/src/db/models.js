import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaOptions = {
    timestamps: true,
    versionKey: false
};

const idField = {
    type: String,
    required: true,
    unique: true,
    index: true
};

const userSchema = new Schema({
    id: idField,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String, default: null, index: true },
    verificationTokenExpires: { type: Date, default: null },
    resetTokenHash: { type: String, default: null, index: true },
    resetTokenExpires: { type: Date, default: null }
}, schemaOptions);

const adminSchema = new Schema({
    id: idField,
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true }
}, schemaOptions);

const inventoryItemSchema = new Schema({
    id: idField,
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['base', 'sauce', 'cheese', 'veggie'], index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, default: 'pcs' },
    lastLowStockAlertAt: { type: Date, default: null }
}, schemaOptions);

const recipeSchema = new Schema({
    itemId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const pizzaSchema = new Schema({
    id: idField,
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    tags: [{ type: String }],
    accent: { type: String, default: '#E4572E' },
    recipe: { type: [recipeSchema], default: [] }
}, schemaOptions);

const orderItemSchema = new Schema({
    type: { type: String, required: true, enum: ['pizza', 'custom'] },
    name: { type: String, required: true },
    summary: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    recipe: { type: [recipeSchema], default: [] }
}, { _id: false });

const statusHistorySchema = new Schema({
    status: { type: String, required: true },
    at: { type: Date, required: true }
}, { _id: false });

const orderSchema = new Schema({
    id: idField,
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        required: true,
        enum: ['PENDING_PAYMENT', 'RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING_PAYMENT',
        index: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentProvider: {
        type: String,
        enum: ['razorpay', 'mock', null],
        default: null
    },
    paymentOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    statusHistory: { type: [statusHistorySchema], default: [] }
}, schemaOptions);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
export const Pizza = mongoose.models.Pizza || mongoose.model('Pizza', pizzaSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
