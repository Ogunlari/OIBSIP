import cron from 'node-cron';
import { checkLowStockAndAlert } from './services/inventoryAlerts.js';
import { cancelStaleOrders } from './services/orders.js';

const runLowStockCheck = () => {
    checkLowStockAndAlert().catch((error) => {
        console.error('Low stock job failed:', error.message);
    });
};

const runPendingOrderCleanup = () => {
    cancelStaleOrders()
        .then((count) => {
            if (count > 0) {
                console.log(`Cancelled ${count} stale pending order(s).`);
            }
        })
        .catch((error) => {
            console.error('Pending order cleanup job failed:', error.message);
        });
};

export const startJobs = () => {
    cron.schedule('*/5 * * * *', runLowStockCheck);
    cron.schedule('*/10 * * * *', runPendingOrderCleanup);
    setTimeout(runLowStockCheck, 5000);
};
