import { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md"
}) => {
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full ${sizes[size]} bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl animate-in`}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-dark-600">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className={title ? "p-6" : "p-6"}>
                    {!title && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};
