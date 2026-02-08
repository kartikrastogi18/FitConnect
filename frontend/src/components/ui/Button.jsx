import { forwardRef } from "react";

export const Button = forwardRef(({
    children,
    variant = "neon",
    size = "md",
    className = "",
    loading = false,
    disabled = false,
    ...props
}, ref) => {
    const variants = {
        neon: "btn-neon",
        electric: "btn-electric",
        dark: "btn-dark",
        ghost: "btn-ghost",
        danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all",
        secondary: "bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30 px-4 py-2 rounded-lg font-medium transition-all",
    };

    const sizes = {
        sm: "text-sm px-3 py-1.5",
        md: "",
        lg: "text-lg px-8 py-4",
    };

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`${variants[variant]} ${sizes[size]} ${className} inline-flex items-center justify-center gap-2`}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
});

Button.displayName = "Button";
