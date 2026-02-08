export const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "px-3 py-1 rounded-full text-xs font-bold bg-dark-600 text-gray-300 border border-dark-500",
        primary: "badge-neon",
        success: "badge-neon",
        warning: "badge-pending",
        danger: "badge-danger",
        info: "badge-electric",
    };

    return (
        <span className={`inline-flex items-center ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
