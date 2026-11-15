const formatterCache = new Map();

const getFormatter = (currencyCode) => {
    if (!formatterCache.has(currencyCode)) {
        formatterCache.set(currencyCode, new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0
        }));
    }
    return formatterCache.get(currencyCode);
};

export const currency = (value, currencyCode = 'INR') => (
    getFormatter(currencyCode).format(Number(value) || 0)
);

export const formatDate = (value) => {
    if (!value) {
        return '';
    }
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(new Date(value));
};

export const shortOrderId = (id) => (id ? id.slice(0, 8).toUpperCase() : '');

export const STATUS_LABELS = {
    PENDING_PAYMENT: 'Awaiting payment',
    RECEIVED: 'Order received',
    IN_KITCHEN: 'In the kitchen',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

export const statusLabel = (status) => STATUS_LABELS[status] || status;

export const statusClass = (status) => (
    `status status--${String(status || '').toLowerCase().replaceAll('_', '-')}`
);

export const STATUS_FLOW = ['RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const NEXT_STATUS = {
    RECEIVED: 'IN_KITCHEN',
    IN_KITCHEN: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED'
};

export const NEXT_STATUS_LABELS = {
    IN_KITCHEN: 'Start kitchen',
    OUT_FOR_DELIVERY: 'Send out',
    DELIVERED: 'Mark delivered'
};
