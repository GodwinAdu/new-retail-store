"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getStoreSettings } from "@/lib/actions/settings.actions";

interface PosSettings {
    autoReceiptPrint: boolean;
    showItemImages: boolean;
    quickPayEnabled: boolean;
    taxIncluded: boolean;
    defaultTaxRate: number;
    allowDiscounts: boolean;
    maxDiscountPercent: number;
    requireCustomerInfo: boolean;
    soundEffects: boolean;
    compactMode: boolean;
    barcodeScanning: boolean;
    inventoryTracking: boolean;
    loyaltyProgram: boolean;
    multiCurrency: boolean;
}

interface InventorySettings {
    lowStockAlert: boolean;
    lowStockThreshold: number;
    autoReorder: boolean;
    reorderPoint: number;
    trackExpiry: boolean;
    batchTracking: boolean;
    serialNumberTracking: boolean;
}

interface SettingsContextType {
    posSettings: PosSettings;
    inventorySettings: InventorySettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultPosSettings: PosSettings = {
    autoReceiptPrint: true,
    showItemImages: true,
    quickPayEnabled: true,
    taxIncluded: false,
    defaultTaxRate: 0.15,
    allowDiscounts: true,
    maxDiscountPercent: 20,
    requireCustomerInfo: false,
    soundEffects: true,
    compactMode: false,
    barcodeScanning: true,
    inventoryTracking: true,
    loyaltyProgram: false,
    multiCurrency: false,
};

const defaultInventorySettings: InventorySettings = {
    lowStockAlert: true,
    lowStockThreshold: 10,
    autoReorder: false,
    reorderPoint: 5,
    trackExpiry: true,
    batchTracking: false,
    serialNumberTracking: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
    children, 
    storeId 
}: { 
    children: React.ReactNode;
    storeId: string;
}) {
    const [posSettings, setPosSettings] = useState<PosSettings>(defaultPosSettings);
    const [inventorySettings, setInventorySettings] = useState<InventorySettings>(defaultInventorySettings);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        if (!storeId) return;
        
        try {
            setLoading(true);
            const store = await getStoreSettings(storeId);
            
            if (store) {
                setPosSettings(store.posSettings || defaultPosSettings);
                setInventorySettings(store.inventorySettings || defaultInventorySettings);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, [storeId]);

    return (
        <SettingsContext.Provider value={{
            posSettings,
            inventorySettings,
            loading,
            refreshSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}