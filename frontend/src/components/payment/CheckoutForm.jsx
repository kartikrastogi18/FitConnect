import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Shield, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutForm = ({ onPaymentSuccess, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
                toast.error(error.message);
            } else {
                setMessage("An unexpected error occurred.");
                toast.error("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onPaymentSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-dark-700/50 p-4 rounded-xl border border-dark-600">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            </div>

            <div className="flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl">
                <Shield className="w-5 h-5 text-neon-green flex-shrink-0" />
                <p className="text-sm text-gray-300">
                    Your payment is held securely in escrow until the session is completed.
                </p>
            </div>

            {message && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="btn-neon w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{amount} & Unlock
                    </>
                )}
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs text-center">
                <Lock className="w-3 h-3" />
                SECURE ENCRYPTED TRANSACTION
            </div>
        </form>
    );
};
