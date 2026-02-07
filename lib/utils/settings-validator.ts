import { toast } from "sonner";

export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export class SettingsValidator {
    static validateDiscount(
        discountType: "percentage" | "fixed",
        discountValue: number,
        posSettings: any,
        subtotal: number
    ): ValidationResult {
        if (!posSettings.allowDiscounts) {
            return {
                isValid: false,
                message: "Discounts are not allowed in current settings"
            };
        }

        if (discountType === "percentage") {
            if (discountValue > posSettings.maxDiscountPercent) {
                return {
                    isValid: false,
                    message: `Maximum discount allowed is ${posSettings.maxDiscountPercent}%`
                };
            }
        } else {
            if (discountValue > subtotal) {
                return {
                    isValid: false,
                    message: "Discount amount cannot exceed subtotal"
                };
            }
        }

        return { isValid: true };
    }

    static validateStock(
        requestedQuantity: number,
        availableStock: number,
        inventorySettings: any
    ): ValidationResult {
        if (!inventorySettings.inventoryTracking) {
            return { isValid: true };
        }

        if (requestedQuantity > availableStock) {
            return {
                isValid: false,
                message: `Only ${availableStock} items available in stock`
            };
        }

        return { isValid: true };
    }

    static checkLowStockAlert(
        currentStock: number,
        minStock: number,
        inventorySettings: any
    ): boolean {
        if (!inventorySettings.lowStockAlert) {
            return false;
        }

        const threshold = minStock || inventorySettings.lowStockThreshold;
        return currentStock <= threshold && currentStock > 0;
    }

    static validateCustomerRequired(
        hasCustomer: boolean,
        posSettings: any
    ): ValidationResult {
        if (posSettings.requireCustomerInfo && !hasCustomer) {
            return {
                isValid: false,
                message: "Customer information is required for this transaction"
            };
        }

        return { isValid: true };
    }

    static calculateTax(
        subtotal: number,
        posSettings: any
    ): number {
        if (posSettings.taxIncluded) {
            return 0;
        }

        return subtotal * posSettings.defaultTaxRate;
    }

    static shouldAutoReorder(
        currentStock: number,
        inventorySettings: any
    ): boolean {
        if (!inventorySettings.autoReorder) {
            return false;
        }

        return currentStock <= inventorySettings.reorderPoint;
    }

    static validateBarcodeScanning(
        posSettings: any
    ): ValidationResult {
        if (!posSettings.barcodeScanning) {
            return {
                isValid: false,
                message: "Barcode scanning is disabled in settings"
            };
        }

        return { isValid: true };
    }

    static shouldShowLoyaltyPoints(
        posSettings: any
    ): boolean {
        return posSettings.loyaltyProgram;
    }

    static validatePaymentMethod(
        paymentMethod: string,
        posSettings: any
    ): ValidationResult {
        if (paymentMethod === "crypto" && !posSettings.multiCurrency) {
            return {
                isValid: false,
                message: "Multi-currency payments are not enabled"
            };
        }

        return { isValid: true };
    }
}