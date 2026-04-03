"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/lib/contexts/SettingsContext";
import {
    Settings, ShoppingCart, Package, CheckCircle, XCircle, AlertTriangle,
    Percent, Receipt, Scan, Users, DollarSign
} from "lucide-react";

export default function SettingsSummary() {
    const { posSettings, inventorySettings, loading } = useSettings();

    if (loading) {
        return (
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="text-gray-500">Loading settings...</div>
                </CardContent>
            </Card>
        );
    }

    const StatusIcon = ({ enabled }: { enabled: boolean }) => (
        enabled
            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
            : <XCircle className="w-4 h-4 text-gray-300" />
    );

    const SettingItem = ({ icon: Icon, label, value, enabled }: { icon: any; label: string; value?: string | number; enabled?: boolean }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 text-sm">{label}</span>
            </div>
            <div className="flex items-center space-x-2">
                {value && <Badge className="bg-emerald-50 text-emerald-700 border-0">{value}</Badge>}
                {enabled !== undefined && <StatusIcon enabled={enabled} />}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-emerald-500" />
                        POS Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <SettingItem icon={Receipt} label="Auto Receipt Print" enabled={posSettings.autoReceiptPrint} />
                    <SettingItem icon={Package} label="Show Item Images" enabled={posSettings.showItemImages} />
                    <SettingItem icon={DollarSign} label="Quick Pay" enabled={posSettings.quickPayEnabled} />
                    <SettingItem icon={DollarSign} label="Tax Rate" value={`${(posSettings.defaultTaxRate * 100).toFixed(1)}%`} />
                    <SettingItem icon={Percent} label="Allow Discounts" enabled={posSettings.allowDiscounts} />
                    {posSettings.allowDiscounts && <SettingItem icon={Percent} label="Max Discount" value={`${posSettings.maxDiscountPercent}%`} />}
                    <SettingItem icon={Users} label="Require Customer Info" enabled={posSettings.requireCustomerInfo} />
                    <SettingItem icon={Scan} label="Barcode Scanning" enabled={posSettings.barcodeScanning} />
                    <SettingItem icon={Users} label="Loyalty Program" enabled={posSettings.loyaltyProgram} />
                </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-cyan-500" />
                        Inventory Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <SettingItem icon={AlertTriangle} label="Low Stock Alerts" enabled={inventorySettings.lowStockAlert} />
                    {inventorySettings.lowStockAlert && <SettingItem icon={AlertTriangle} label="Low Stock Threshold" value={inventorySettings.lowStockThreshold} />}
                    <SettingItem icon={Package} label="Auto Reorder" enabled={inventorySettings.autoReorder} />
                    {inventorySettings.autoReorder && <SettingItem icon={Package} label="Reorder Point" value={inventorySettings.reorderPoint} />}
                    <SettingItem icon={AlertTriangle} label="Track Expiry" enabled={inventorySettings.trackExpiry} />
                    <SettingItem icon={Package} label="Batch Tracking" enabled={inventorySettings.batchTracking} />
                    <SettingItem icon={Scan} label="Serial Number Tracking" enabled={inventorySettings.serialNumberTracking} />
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-500" />
                        Settings Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">
                                {Object.values(posSettings).filter(Boolean).length}
                            </div>
                            <p className="text-gray-600 text-sm">POS Features Enabled</p>
                        </div>
                        <div className="text-center p-4 bg-cyan-50 rounded-xl">
                            <div className="text-2xl font-bold text-cyan-600 mb-1">
                                {Object.values(inventorySettings).filter(Boolean).length}
                            </div>
                            <p className="text-gray-600 text-sm">Inventory Features Enabled</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {posSettings.allowDiscounts ? posSettings.maxDiscountPercent : 0}%
                            </div>
                            <p className="text-gray-600 text-sm">Max Discount Allowed</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="text-gray-900 font-medium mb-2">Active Automations</h4>
                        <div className="flex flex-wrap gap-2">
                            {posSettings.autoReceiptPrint && <Badge className="bg-emerald-100 text-emerald-700 border-0">Auto Receipt Print</Badge>}
                            {inventorySettings.lowStockAlert && <Badge className="bg-amber-100 text-amber-700 border-0">Low Stock Alerts</Badge>}
                            {inventorySettings.autoReorder && <Badge className="bg-cyan-100 text-cyan-700 border-0">Auto Reorder</Badge>}
                            {posSettings.loyaltyProgram && <Badge className="bg-blue-100 text-blue-700 border-0">Loyalty Program</Badge>}
                            {inventorySettings.trackExpiry && <Badge className="bg-red-100 text-red-700 border-0">Expiry Tracking</Badge>}
                            {!posSettings.autoReceiptPrint && !inventorySettings.lowStockAlert && !inventorySettings.autoReorder && !posSettings.loyaltyProgram && !inventorySettings.trackExpiry && (
                                <span className="text-gray-400 text-sm">No automations enabled</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
