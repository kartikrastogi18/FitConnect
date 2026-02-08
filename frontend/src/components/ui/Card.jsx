export const Card = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`card-dark ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
