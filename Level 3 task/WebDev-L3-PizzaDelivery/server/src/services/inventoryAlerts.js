import { env } from '../config/env.js';
import { store } from '../db/index.js';
import { cleanDocuments } from '../utils/serializers.js';
import { emitToAdmins } from '../realtime.js';
import { sendLowStockAlert } from './email.js';

export const checkLowStockAndAlert = async ({ itemIds = null } = {}) => {
    const items = await store.inventory.list();
    const now = Date.now();
    const cooldownMs = env.lowStockCooldownMinutes * 60 * 1000;

    const candidates = items.filter((item) => {
        if (itemIds && !itemIds.includes(item.id)) {
            return false;
        }
        if (item.stock > item.threshold) {
            return false;
        }
        if (!item.lastLowStockAlertAt) {
            return true;
        }
        return now - new Date(item.lastLowStockAlertAt).getTime() >= cooldownMs;
    });

    if (candidates.length === 0) {
        return [];
    }

    try {
        await sendLowStockAlert(candidates);
    } catch (error) {
        console.error('Low stock alert email failed:', error.message);
        return [];
    }

    await store.inventory.markAlerted(candidates.map((item) => item.id), new Date());
    const cleanItems = cleanDocuments(candidates);
    emitToAdmins('inventory:low', cleanItems);
    return cleanItems;
};
