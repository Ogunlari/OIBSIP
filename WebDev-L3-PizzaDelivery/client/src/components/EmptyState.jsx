export const EmptyState = ({ title, children, action }) => (
    <div className="empty-state">
        <span className="empty-state__mark" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{children}</p>
        {action}
    </div>
);
