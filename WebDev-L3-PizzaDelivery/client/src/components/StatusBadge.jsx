import { statusClass, statusLabel } from '../utils/format.js';

export const StatusBadge = ({ status }) => (
    <span className={statusClass(status)}>{statusLabel(status)}</span>
);
