"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, MapPin, User, Save, Loader2, Settings2, ShoppingCart, Package, Trash2, AlertTriangle } from "lucide-react";
import { updateStoreSettings, updateUserProfile } from "@/lib/actions/settings.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SettingsSummary from "@/components/SettingsSummary";

interface SettingsClientProps {
    user: any;
    store: any;
    storeId: string;
}

export default function SettingsClient({ user, store, storeId }: SettingsClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState({ store: false, user: false, delete: false });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const [storeData, setStoreData] = useState({
        name: store?.name || "",
        description: store?.description || "",
        phone: store?.storePhone || "",
        email: store?.storeEmail || ""
    });

  

    const [posSettings, setPosSettings] = useState({
        autoReceiptPrint: store?.posSettings?.autoReceiptPrint ?? true,
        showItemImages: store?.posSettings?.showItemImages ?? true,
        quickPayEnabled: store?.posSettings?.quickPayEnabled ?? true,
        taxIncluded: store?.posSettings?.taxIncluded ?? false,
        defaultTaxRate: store?.posSettings?.defaultTaxRate ?? 0.15,
        allowDiscounts: store?.posSettings?.allowDiscounts ?? true,
        maxDiscountPercent: store?.posSettings?.maxDiscountPercent ?? 20,
        requireCustomerInfo: store?.posSettings?.requireCustomerInfo ?? false,
        soundEffects: store?.posSettings?.soundEffects ?? true,
        compactMode: store?.posSettings?.compactMode ?? false,
        barcodeScanning: store?.posSettings?.barcodeScanning ?? true,
        inventoryTracking: store?.posSettings?.inventoryTracking ?? true,
        loyaltyProgram: store?.posSettings?.loyaltyProgram ?? false,
        multiCurrency: store?.posSettings?.multiCurrency ?? false
    });

    const [inventorySettings, setInventorySettings] = useState({
        lowStockAlert: store?.inventorySettings?.lowStockAlert ?? true,
        lowStockThreshold: store?.inventorySettings?.lowStockThreshold ?? 10,
        autoReorder: store?.inventorySettings?.autoReorder ?? false,
        reorderPoint: store?.inventorySettings?.reorderPoint ?? 5,
        trackExpiry: store?.inventorySettings?.trackExpiry ?? true,
        batchTracking: store?.inventorySettings?.batchTracking ?? false,
        serialNumberTracking: store?.inventorySettings?.serialNumberTracking ?? false
    });

    const [userData, setUserData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || ""
    });

    const handleStoreUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(prev => ({ ...prev, store: true }));

        try {
            const result = await updateStoreSettings(storeId, { ...storeData, posSettings, inventorySettings });
            if (result?.success) {
                toast.success("Settings saved successfully");
                router.refresh();
            } else {
                toast.error(result?.error || "Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating store:", error);
            toast.error("Failed to update store settings");
        } finally {
            setLoading(prev => ({ ...prev, store: false }));
        }
    };

    const handleUserUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, user: true }));

        try {
            const result = await updateUserProfile(user._id, userData);
            if (result?.success) {
                toast.success("Profile updated successfully");
                router.refresh();
            } else {
                toast.error(result?.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(prev => ({ ...prev, user: false }));
        }
    };

    return (
        <div className="space-y-8">
            <SettingsSummary />
            
            <Tabs defaultValue="general" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-white/80 via-gray-50/80 to-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-2">
                <TabsTrigger value="general" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg text-gray-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
                    <Store className="w-4 h-4 mr-2" />
                    General
                </TabsTrigger>
                <TabsTrigger value="pos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg text-gray-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    POS
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg text-gray-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
                    <Package className="w-4 h-4 mr-2" />
                    Inventory
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg text-gray-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center">
                            <Store className="w-5 h-5 mr-2" />
                            Store Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleStoreUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="storeName" className="text-gray-600">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        value={storeData.name}
                                        onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                                        className="border-gray-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="storePhone" className="text-gray-600">Phone</Label>
                                    <Input
                                        id="storePhone"
                                        value={storeData.phone}
                                        onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
                                        className="border-gray-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="storeEmail" className="text-gray-600">Email</Label>
                                <Input
                                    id="storeEmail"
                                    type="email"
                                    value={storeData.email}
                                    onChange={(e) => setStoreData({...storeData, email: e.target.value})}
                                    className="border-gray-200"
                                />
                            </div>
                            <div>
                                <Label htmlFor="storeDescription" className="text-gray-600">Description</Label>
                                <Textarea
                                    id="storeDescription"
                                    value={storeData.description}
                                    onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                                    className="border-gray-200"
                                    rows={3}
                                />
                            </div>
                            <Button type="submit" disabled={loading.store} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                                {loading.store ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Store Settings
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="pos" className="space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            POS Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Auto Receipt Print</Label>
                                    <p className="text-gray-500 text-sm">Automatically print receipts after payment</p>
                                </div>
                                <Switch
                                    checked={posSettings.autoReceiptPrint}
                                    onCheckedChange={(checked) => setPosSettings({...posSettings, autoReceiptPrint: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Show Item Images</Label>
                                    <p className="text-gray-500 text-sm">Display product images in POS</p>
                                </div>
                                <Switch
                                    checked={posSettings.showItemImages}
                                    onCheckedChange={(checked) => setPosSettings({...posSettings, showItemImages: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Quick Pay</Label>
                                    <p className="text-gray-500 text-sm">Enable quick payment options</p>
                                </div>
                                <Switch
                                    checked={posSettings.quickPayEnabled}
                                    onCheckedChange={(checked) => setPosSettings({...posSettings, quickPayEnabled: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-emerald-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Barcode Scanning</Label>
                                    <p className="text-gray-500 text-sm">Enable barcode scanner support</p>
                                </div>
                                <Switch
                                    checked={posSettings.barcodeScanning}
                                    onCheckedChange={(checked) => setPosSettings({...posSettings, barcodeScanning: checked})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-600">Default Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={posSettings.defaultTaxRate * 100}
                                    onChange={(e) => setPosSettings({...posSettings, defaultTaxRate: parseFloat(e.target.value) / 100})}
                                    className="border-gray-200 mt-2"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-600">Max Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={posSettings.maxDiscountPercent}
                                    onChange={(e) => setPosSettings({...posSettings, maxDiscountPercent: parseInt(e.target.value)})}
                                    className="border-gray-200 mt-2"
                                />
                            </div>
                        </div>
                        <Button onClick={handleStoreUpdate} disabled={loading.store} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            {loading.store ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save POS Settings
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
                <Card className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Inventory Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-cyan-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Low Stock Alerts</Label>
                                    <p className="text-gray-500 text-sm">Get notified when stock is low</p>
                                </div>
                                <Switch
                                    checked={inventorySettings.lowStockAlert}
                                    onCheckedChange={(checked) => setInventorySettings({...inventorySettings, lowStockAlert: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-cyan-400 transition-all duration-300">
                                <div>
                                    <Label className="text-gray-900 font-medium">Track Expiry</Label>
                                    <p className="text-gray-500 text-sm">Monitor product expiration dates</p>
                                </div>
                                <Switch
                                    checked={inventorySettings.trackExpiry}
                                    onCheckedChange={(checked) => setInventorySettings({...inventorySettings, trackExpiry: checked})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-600">Low Stock Threshold</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={inventorySettings.lowStockThreshold}
                                    onChange={(e) => setInventorySettings({...inventorySettings, lowStockThreshold: parseInt(e.target.value)})}
                                    className="border-gray-200 mt-2"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-600">Reorder Point</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={inventorySettings.reorderPoint}
                                    onChange={(e) => setInventorySettings({...inventorySettings, reorderPoint: parseInt(e.target.value)})}
                                    className="border-gray-200 mt-2"
                                />
                            </div>
                        </div>
                        <Button onClick={handleStoreUpdate} disabled={loading.store} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            {loading.store ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Inventory Settings
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">

                <Card className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-gray-900 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Profile Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUserUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fullName" className="text-gray-600">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={userData.fullName}
                                        onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                                        className="border-gray-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="userPhone" className="text-gray-600">Phone</Label>
                                    <Input
                                        id="userPhone"
                                        value={userData.phone}
                                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                        className="border-gray-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="userEmail" className="text-gray-600">Email</Label>
                                <Input
                                    id="userEmail"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                                    className="border-gray-200"
                                />
                            </div>
                            <Button type="submit" disabled={loading.user} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                                {loading.user ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
    );
}