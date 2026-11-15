export const Spinner = ({ label = 'Loading...' }) => (
    <div className="spinner-wrap">
        <span className="spinner" aria-hidden="true" />
        <span>{label}</span>
    </div>
);

export const PageLoader = ({ label = 'Loading SliceCraft...' }) => (
    <div className="page-loader">
        <Spinner label={label} />
    </div>
);
