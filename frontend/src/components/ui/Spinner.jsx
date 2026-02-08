export const Spinner = ({ size = "md", className = "" }) => {
    const sizes = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div
            className={`${sizes[size]} border-4 border-neon-green border-t-transparent rounded-full animate-spin ${className}`}
        />
    );
};
