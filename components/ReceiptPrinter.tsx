"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { toast } from "sonner";

interface ReceiptPrinterProps {
    sale: any;
    onPrintComplete?: () => void;
}

export default function ReceiptPrinter({ sale, onPrintComplete }: ReceiptPrinterProps) {
    const { posSettings } = useSettings();

    useEffect(() => {
        if (sale && posSettings.autoReceiptPrint) {
            // Auto print receipt if setting is enabled
            setTimeout(() => {
                handlePrint();
            }, 1000);
        }
    }, [sale, posSettings.autoReceiptPrint]);

    const handlePrint = () => {
        if (posSettings.soundEffects) {
            // Play print sound effect
            const audio = new Audio('/sounds/print.mp3');
            audio.play().catch(() => {
                // Ignore audio errors
            });
        }

        window.print();
        
        if (posSettings.autoReceiptPrint) {
            toast.success("Receipt printed automatically");
        } else {
            toast.success("Receipt sent to printer");
        }
        
        onPrintComplete?.();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (!sale) return null;

    return (
        <div className="hidden print:block">
            <div className="max-w-sm mx-auto bg-white text-black p-4 font-mono text-sm">
                {/* Header */}
                <div className="text-center border-b-2 border-dashed border-gray-400 pb-2 mb-2">
                    <h1 className="text-lg font-bold">RetailPOS Pro</h1>
                    <p className="text-xs">Receipt #{sale.id}</p>
                    <p className="text-xs">{new Date(sale.timestamp).toLocaleString()}</p>
                </div>

                {/* Customer Info */}
                {sale.customer && (
                    <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                        <p className="text-xs">Customer: {sale.customer.name}</p>
                        <p className="text-xs">{sale.customer.email}</p>
                        {posSettings.loyaltyProgram && (
                            <p className="text-xs">Loyalty Points: {sale.customer.loyaltyPoints}</p>
                        )}
                    </div>
                )}

                {/* Items */}
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    {sale.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs mb-1">
                            <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-gray-600">{item.quantity} x {formatCurrency(item.price)}</p>
                            </div>
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(sale.subtotal)}</span>
                    </div>
                    
                    {sale.discount > 0 && (
                        <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-{formatCurrency(sale.discount)}</span>
                        </div>
                    )}
                    
                    {!posSettings.taxIncluded && sale.tax > 0 && (
                        <div className="flex justify-between">
                            <span>Tax ({(posSettings.defaultTaxRate * 100).toFixed(1)}%):</span>
                            <span>{formatCurrency(sale.tax)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between font-bold border-t border-gray-400 pt-1">
                        <span>Total:</span>
                        <span>{formatCurrency(sale.total)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span>Payment:</span>
                        <span className="capitalize">{sale.paymentMethod}</span>
                    </div>
                    
                    {sale.change > 0 && (
                        <div className="flex justify-between">
                            <span>Change:</span>
                            <span>{formatCurrency(sale.change)}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-xs mt-4 pt-2 border-t border-dashed border-gray-400">
                    <p>Thank you for your business!</p>
                    <p>Visit us again soon</p>
                    {posSettings.loyaltyProgram && (
                        <p className="mt-1">Earn points with every purchase!</p>
                    )}
                </div>
            </div>
        </div>
    );
}