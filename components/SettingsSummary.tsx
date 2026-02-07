"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { 
    Settings, 
    ShoppingCart, 
    Package, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Percent,
    Receipt,
    Scan,
    Users,
    DollarSign
} from "lucide-react";

export default function SettingsSummary() {
    const { posSettings, inventorySettings, loading } = useSettings();

    if (loading) {
        return (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                    <div className="text-white">Loading settings...</div>
                </CardContent>
            </Card>
        );
    }

    const StatusIcon = ({ enabled }: { enabled: boolean }) => (
        enabled ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
            <XCircle className="w-4 h-4 text-red-400" />
        )
    );

    const SettingItem = ({ 
        icon: Icon, 
        label, 
        value, 
        enabled 
    }: { 
        icon: any; 
        label: string; 
        value?: string | number; 
        enabled?: boolean; 
    }) => (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-gray-300" />
                <span className="text-white text-sm">{label}</span>
            </div>
            <div className="flex items-center space-x-2">
                {value && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {value}
                    </Badge>
                )}
                {enabled !== undefined && <StatusIcon enabled={enabled} />}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* POS Settings */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border-blue-500/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        POS Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <SettingItem
                        icon={Receipt}
                        label="Auto Receipt Print"
                        enabled={posSettings.autoReceiptPrint}
                    />
                    <SettingItem
                        icon={Package}
                        label="Show Item Images"
                        enabled={posSettings.showItemImages}
                    />
                    <SettingItem
                        icon={DollarSign}
                        label="Quick Pay"
                        enabled={posSettings.quickPayEnabled}
                    />
                    <SettingItem
                        icon={DollarSign}
                        label="Tax Rate"
                        value={`${(posSettings.defaultTaxRate * 100).toFixed(1)}%`}
                    />
                    <SettingItem
                        icon={Percent}
                        label="Allow Discounts"
                        enabled={posSettings.allowDiscounts}
                    />
                    {posSettings.allowDiscounts && (
                        <SettingItem
                            icon={Percent}
                            label="Max Discount"
                            value={`${posSettings.maxDiscountPercent}%`}
                        />
                    )}
                    <SettingItem
                        icon={Users}
                        label="Require Customer Info"
                        enabled={posSettings.requireCustomerInfo}
                    />
                    <SettingItem
                        icon={Scan}
                        label="Barcode Scanning"
                        enabled={posSettings.barcodeScanning}
                    />
                    <SettingItem
                        icon={Users}
                        label="Loyalty Program"
                        enabled={posSettings.loyaltyProgram}
                    />
                </CardContent>
            </Card>

            {/* Inventory Settings */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border-green-500/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Inventory Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <SettingItem
                        icon={AlertTriangle}
                        label="Low Stock Alerts"
                        enabled={inventorySettings.lowStockAlert}
                    />
                    {inventorySettings.lowStockAlert && (
                        <SettingItem
                            icon={AlertTriangle}
                            label="Low Stock Threshold"
                            value={inventorySettings.lowStockThreshold}
                        />
                    )}
                    <SettingItem
                        icon={Package}
                        label="Auto Reorder"
                        enabled={inventorySettings.autoReorder}
                    />
                    {inventorySettings.autoReorder && (
                        <SettingItem
                            icon={Package}
                            label="Reorder Point"
                            value={inventorySettings.reorderPoint}
                        />
                    )}
                    <SettingItem
                        icon={AlertTriangle}
                        label="Track Expiry"
                        enabled={inventorySettings.trackExpiry}
                    />
                    <SettingItem
                        icon={Package}
                        label="Batch Tracking"
                        enabled={inventorySettings.batchTracking}
                    />
                    <SettingItem
                        icon={Scan}
                        label="Serial Number Tracking"
                        enabled={inventorySettings.serialNumberTracking}
                    />
                </CardContent>
            </Card>

            {/* Settings Impact Summary */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border-purple-500/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Settings Impact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                {Object.values(posSettings).filter(Boolean).length}
                            </div>
                            <p className="text-gray-300 text-sm">POS Features Enabled</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                                {Object.values(inventorySettings).filter(Boolean).length}
                            </div>
                            <p className="text-gray-300 text-sm">Inventory Features Enabled</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                                {posSettings.allowDiscounts ? posSettings.maxDiscountPercent : 0}%
                            </div>
                            <p className="text-gray-300 text-sm">Max Discount Allowed</p>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-white font-medium mb-2">Active Automations</h4>
                        <div className="flex flex-wrap gap-2">
                            {posSettings.autoReceiptPrint && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    Auto Receipt Print
                                </Badge>
                            )}
                            {inventorySettings.lowStockAlert && (
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                    Low Stock Alerts
                                </Badge>
                            )}
                            {inventorySettings.autoReorder && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    Auto Reorder
                                </Badge>
                            )}
                            {posSettings.loyaltyProgram && (
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    Loyalty Program
                                </Badge>
                            )}
                            {inventorySettings.trackExpiry && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                    Expiry Tracking
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}