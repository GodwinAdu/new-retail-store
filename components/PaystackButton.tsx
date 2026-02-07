"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface PaystackButtonProps {
    amount: number;
    email: string;
    onSuccess: (reference: string) => void;
    onClose?: () => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export default function PaystackButton({
    amount,
    email,
    onSuccess,
    onClose,
    disabled = false,
    className = "",
    children
}: PaystackButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        if (typeof window === 'undefined' || !window.PaystackPop) {
            console.error('Paystack script not loaded');
            return;
        }

        setLoading(true);

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
            email,
            amount: amount * 100, // Convert to kobo
            currency: 'GHS',
            ref: `retail_${Date.now()}`,
            callback: function(response: any) {
                setLoading(false);
                onSuccess(response.reference);
            },
            onClose: function() {
                setLoading(false);
                onClose?.();
            }
        });

        handler.openIframe();
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={disabled || loading}
            className={`${className} disabled:opacity-50`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <CreditCard className="w-4 h-4 mr-2" />
            )}
            {children || `Pay GH₵${amount}`}
        </Button>
    );
}