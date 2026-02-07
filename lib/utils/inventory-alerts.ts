import { toast } from "sonner";
import { SettingsValidator } from "./settings-validator";

export interface InventoryAlert {
    type: "low_stock" | "out_of_stock" | "reorder" | "expiry";
    productId: string;
    productName: string;
    currentStock: number;
    threshold?: number;
    message: string;
    severity: "info" | "warning" | "error";
}

export class InventoryAlertManager {
    static checkProductAlerts(
        product: any,
        inventorySettings: any
    ): InventoryAlert[] {
        const alerts: InventoryAlert[] = [];

        // Check out of stock
        if (product.stock === 0) {
            alerts.push({
                type: "out_of_stock",
                productId: product._id,
                productName: product.name,
                currentStock: product.stock,
                message: `${product.name} is out of stock`,
                severity: "error"
            });
        }
        // Check low stock
        else if (SettingsValidator.checkLowStockAlert(
            product.stock,
            product.minStock,
            inventorySettings
        )) {
            alerts.push({
                type: "low_stock",
                productId: product._id,
                productName: product.name,
                currentStock: product.stock,
                threshold: product.minStock || inventorySettings.lowStockThreshold,
                message: `${product.name} is running low (${product.stock} left)`,
                severity: "warning"
            });
        }

        // Check auto reorder
        if (SettingsValidator.shouldAutoReorder(product.stock, inventorySettings)) {
            alerts.push({
                type: "reorder",
                productId: product._id,
                productName: product.name,
                currentStock: product.stock,
                threshold: inventorySettings.reorderPoint,
                message: `${product.name} needs to be reordered`,
                severity: "info"
            });
        }

        // Check expiry (if tracking is enabled)
        if (inventorySettings.trackExpiry && product.expiryDate) {
            const daysUntilExpiry = Math.ceil(
                (new Date(product.expiryDate).getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24)
            );
            
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
                alerts.push({
                    type: "expiry",
                    productId: product._id,
                    productName: product.name,
                    currentStock: product.stock,
                    message: `${product.name} expires in ${daysUntilExpiry} days`,
                    severity: "warning"
                });
            } else if (daysUntilExpiry <= 0) {
                alerts.push({
                    type: "expiry",
                    productId: product._id,
                    productName: product.name,
                    currentStock: product.stock,
                    message: `${product.name} has expired`,
                    severity: "error"
                });
            }
        }

        return alerts;
    }

    static processInventoryAlerts(
        products: any[],
        inventorySettings: any
    ): InventoryAlert[] {
        const allAlerts: InventoryAlert[] = [];

        products.forEach(product => {
            const productAlerts = this.checkProductAlerts(product, inventorySettings);
            allAlerts.push(...productAlerts);
        });

        return allAlerts;
    }

    static showAlertToasts(alerts: InventoryAlert[]) {
        const errorAlerts = alerts.filter(a => a.severity === "error");
        const warningAlerts = alerts.filter(a => a.severity === "warning");
        const infoAlerts = alerts.filter(a => a.severity === "info");

        // Show error alerts first
        errorAlerts.forEach(alert => {
            toast.error(alert.message);
        });

        // Show warning alerts
        warningAlerts.slice(0, 3).forEach(alert => {
            toast.warning(alert.message);
        });

        // Show info alerts (limited)
        infoAlerts.slice(0, 2).forEach(alert => {
            toast.info(alert.message);
        });

        // Summary if too many alerts
        const totalAlerts = alerts.length;
        if (totalAlerts > 5) {
            toast.info(`${totalAlerts - 5} more inventory alerts available`);
        }
    }

    static getAlertsByType(
        alerts: InventoryAlert[],
        type: InventoryAlert["type"]
    ): InventoryAlert[] {
        return alerts.filter(alert => alert.type === type);
    }

    static getAlertsBySeverity(
        alerts: InventoryAlert[],
        severity: InventoryAlert["severity"]
    ): InventoryAlert[] {
        return alerts.filter(alert => alert.severity === severity);
    }

    static generateReorderSuggestions(
        alerts: InventoryAlert[],
        inventorySettings: any
    ): Array<{
        productId: string;
        productName: string;
        suggestedQuantity: number;
        currentStock: number;
    }> {
        const reorderAlerts = this.getAlertsByType(alerts, "reorder");
        
        return reorderAlerts.map(alert => ({
            productId: alert.productId,
            productName: alert.productName,
            suggestedQuantity: Math.max(
                inventorySettings.reorderPoint * 2,
                50 // Minimum reorder quantity
            ),
            currentStock: alert.currentStock
        }));
    }
}