"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/actions/product.actions";
import { useSettings } from "@/lib/contexts/SettingsContext";

interface LowStockAlertProps {
    storeId: string;
}

export default function LowStockAlert({ storeId}: LowStockAlertProps) {
    const { inventorySettings } = useSettings();
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (inventorySettings.lowStockAlert && !dismissed) {
            checkLowStock();
        }
    }, [inventorySettings.lowStockAlert, storeId, dismissed]);

    const checkLowStock = async () => {
        try {
            const products = await getProducts(storeId);
            const lowStock = products.filter((product: any) => 
                product.stock > 0 && 
                product.stock <= (product.minStock || inventorySettings.lowStockThreshold)
            );
            setLowStockProducts(lowStock);
        } catch (error) {
            console.error("Error checking low stock:", error);
        }
    };

    if (!inventorySettings.lowStockAlert || dismissed || lowStockProducts.length === 0) {
        return null;
    }

    return (
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-white font-semibold">Low Stock Alert</h3>
                            <p className="text-orange-200 text-sm mb-2">
                                {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {lowStockProducts.slice(0, 3).map((product) => (
                                    <Badge key={product._id} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                        {product.name} ({product.stock} left)
                                    </Badge>
                                ))}
                                {lowStockProducts.length > 3 && (
                                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                        +{lowStockProducts.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDismissed(true)}
                        className="text-orange-300 hover:text-orange-200 hover:bg-orange-500/20"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}