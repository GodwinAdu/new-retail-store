"use client"

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Search, Barcode, User, Settings, Clock, Receipt, X, Check, Zap, TrendingUp, Package, Grid, List, Maximize2, Minimize2, Users, Percent, Scan, Star, Printer, Save, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { getProducts, getProductByBarcode, updateProductStock } from "@/lib/actions/product.actions";
import { getCustomers, createCustomer, updateCustomerLoyaltyPoints } from "@/lib/actions/customer.actions";
import { createSale, getTodaysSales } from "@/lib/actions/sale.actions";
import { getCurrentUser } from "@/lib/utils/auth";
import { updateStoreSettings } from "@/lib/actions/settings.actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { SettingsValidator } from "@/lib/utils/settings-validator";
import { useCartStore } from "@/lib/stores/cart-store";
import { soundManager } from "@/lib/utils/sounds";
import ProductVariationDialog from "@/components/ProductVariationDialog";

interface Customer {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    loyaltyPoints: number;
    totalPurchases: number;
}

interface CartItem {
    id: number;
    _id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    stock: number;
    image: string;
    originalProductId?: string;
    variationName?: string;
}

export default function POSPage() {
    const params = useParams();
    const storeId = params.storeId as string;
    const { posSettings, inventorySettings, refreshSettings } = useSettings();

    const { items: cart, subtotal, tax, taxType, discount, discountType, total, addItem, removeItem, updateQuantity, setTax, setTaxType, setDiscount, setDiscountType, clearCart } = useCartStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amountReceived, setAmountReceived] = useState("");
    const [showCustomer, setShowCustomer] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [viewMode, setViewMode] = useState("grid");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [salesStats, setSalesStats] = useState({ todaySales: 0, todayRevenue: 0 });
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [barcodeInput, setBarcodeInput] = useState("");
    const [lastSale, setLastSale] = useState<any>(null);
    const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
    const [customerSearch, setCustomerSearch] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [tempSettings, setTempSettings] = useState(posSettings);
    const [showVariationDialog, setShowVariationDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fullscreen functionality
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, customersData, salesData, userData] = await Promise.all([
                    getProducts(storeId),
                    getCustomers(storeId),
                    getTodaysSales(storeId),
                    getCurrentUser()
                ]);

                setProducts(productsData);
                setCustomers(customersData);
                setSalesStats(salesData);
                setCurrentUser(userData);
                setTempSettings(posSettings);
                soundManager.setEnabled(posSettings.soundEffects);
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            loadData();
        }
    }, [storeId]);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.categoryId?.name || p.category).filter(Boolean)))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.categoryId.name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: any) => {
        // Check if product has variations
        if (product.variations && product.variations.length > 0 && product.variations.some((v: any) => v.isAvailable)) {
            setSelectedProduct(product);
            setShowVariationDialog(true);
            return;
        }

        const stockValidation = SettingsValidator.validateStock(1, product.stock, inventorySettings);
        if (!stockValidation.isValid) {
            toast.error(stockValidation.message);
            return;
        }

        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            const newQuantity = existingItem.quantity + 1;
            const quantityValidation = SettingsValidator.validateStock(newQuantity, product.stock, inventorySettings);
            if (!quantityValidation.isValid) {
                toast.error(quantityValidation.message);
                return;
            }
        }
        addItem(product);
        if (posSettings.soundEffects) {
            soundManager.addToCart();
        }
    };

    const handleVariationSelect = (variation: any) => {
        if (!selectedProduct) return;

        const productWithVariation = {
            ...selectedProduct,
            _id: `${selectedProduct._id}_${variation.name}`,
            originalProductId: selectedProduct._id,
            price: variation.price,
            name: `${selectedProduct.name} (${variation.name})`,
            variationName: variation.name
        };

        const stockValidation = SettingsValidator.validateStock(1, productWithVariation.stock, inventorySettings);
        if (!stockValidation.isValid) {
            toast.error(stockValidation.message);
            return;
        }

        addItem(productWithVariation);
        if (posSettings.soundEffects) {
            soundManager.addToCart();
        }
        toast.success(`Added ${productWithVariation.name} to cart`);
    };

    const handleQuantityChange = (id: string, change: number) => {
        const item = cart.find(item => item._id === id);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            removeItem(id);
            if (posSettings.soundEffects) {
                soundManager.removeFromCart();
            }
        } else {
            const product = products.find(p => p._id === id);
            if (product && newQuantity > product.stock) {
                toast.error("Not enough stock available");
                return;
            }
            updateQuantity(id, newQuantity);
            if (posSettings.soundEffects) {
                soundManager.click();
            }
        }
    };

    const handleClearCart = () => {
        clearCart();
        setShowPayment(false);
        setAmountReceived("");
    };

    const processPayment = async () => {
        const customerValidation = SettingsValidator.validateCustomerRequired(!!selectedCustomer, posSettings);
        if (!customerValidation.isValid) {
            toast.error(customerValidation.message);
            return;
        }

        const paymentValidation = SettingsValidator.validatePaymentMethod(paymentMethod, posSettings);
        if (!paymentValidation.isValid) {
            toast.error(paymentValidation.message);
            return;
        }

        if (paymentMethod === "cash") {
            const received = parseFloat(amountReceived);
            if (received < total) {
                toast.error("Insufficient amount received");
                return;
            }
        }

        try {
            // Create sale record in database
            const saleData = {
                storeId,

                items: cart.map(item => {
                    // Extract the original product ID (remove variation suffix if present)
                    const productId = item.originalProductId || (item._id.includes('_') ? item._id.split('_')[0] : item._id);
                    return {
                        productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        variations: item.variationName ? [item.variationName] : []
                    };
                }),
                subtotal,
                tax: taxType === 'percentage' ? (subtotal * tax) / 100 : tax,
                taxType,
                discount: discountType === 'percentage' ? (subtotal * discount) / 100 : discount,
                discountType,
                total,
                paymentMethod,
                customerId: selectedCustomer?._id,
                customerName: selectedCustomer?.name,
                customerPhone: selectedCustomer?.phone
            };

            const result = await createSale(storeId, saleData);

            if (result.success) {
                // Update product stock
                for (const item of cart) {
                    // Extract the original product ID (remove variation suffix if present)
                    const productId = item.originalProductId || (item._id.includes('_') ? item._id.split('_')[0] : item._id);
                    await updateProductStock(storeId, productId, item.quantity);
                }

                // Update customer loyalty points
                if (selectedCustomer && posSettings.loyaltyProgram) {
                    const points = Math.floor(total / 10); // 1 point per $10
                    await updateCustomerLoyaltyPoints(selectedCustomer._id, points);
                }

                setLastSale({ ...saleData, timestamp: new Date(), id: result.sale._id, saleNumber: result.sale.saleNumber, change: paymentMethod === "cash" ? parseFloat(amountReceived) - total : 0 });
                setSalesStats(prev => ({
                    todaySales: prev.todaySales + 1,
                    todayRevenue: prev.todayRevenue + total
                }));

                toast.success("Payment processed successfully!");
                if (posSettings.soundEffects) {
                    soundManager.paymentSuccess();
                }
                setShowReceipt(true);
                handleClearCart();

                // Refresh products to update stock
                const updatedProducts = await getProducts(storeId);
                setProducts(updatedProducts);
            } else {
                toast.error("Failed to process payment");
                if (posSettings.soundEffects) {
                    soundManager.paymentError();
                }
            }
        } catch (error) {
            console.error("Payment processing error:", error);
            toast.error("Payment processing failed");
            if (posSettings.soundEffects) {
                soundManager.paymentError();
            }
        }
    };





    const handleBarcodeSearch = async () => {
        const barcodeValidation = SettingsValidator.validateBarcodeScanning(posSettings);
        if (!barcodeValidation.isValid) {
            toast.error(barcodeValidation.message);
            return;
        }

        try {
            const product = await getProductByBarcode(storeId, barcodeInput);
            if (product) {
                addToCart(product);
                setBarcodeInput("");
                toast.success(`Added ${product.name} to cart`);
                if (posSettings.soundEffects) {
                    soundManager.scan();
                }
            } else {
                toast.error("Product not found");
                if (posSettings.soundEffects) {
                    soundManager.paymentError();
                }
            }
        } catch (error) {
            console.error("Barcode search error:", error);
            toast.error("Failed to search product");
            if (posSettings.soundEffects) {
                soundManager.paymentError();
            }
        }
    };

    const selectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowCustomer(false);
        toast.success(`Customer selected: ${customer.name}`);
    };

    const addNewCustomer = async () => {
        if (newCustomer.name && newCustomer.email) {
            try {
                const customerData = {

                    ...newCustomer
                };

                const customer = await createCustomer(storeId, customerData);

                if (customer) {
                    setCustomers(prev => [...prev, customer]);
                    setSelectedCustomer(customer);
                    setNewCustomer({ name: "", email: "", phone: "" });
                    setShowNewCustomer(false);
                    setShowCustomer(false);
                    toast.success(`Customer added: ${customer.name}`);
                } else {
                    toast.error("Failed to add customer");
                }
            } catch (error) {
                console.error("Add customer error:", error);
                toast.error("Failed to add customer");
            }
        }
    };

    const printReceipt = () => {
        if (posSettings.autoReceiptPrint) {
            window.print();
            toast.success("Receipt sent to printer");
        } else {
            window.print();
            toast.success("Receipt printed");
        }
    };

    const saveTransaction = () => {
        // In a real app, this would save to database
        toast.success("Transaction saved");
    };



    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
        (customer.phone && customer.phone.includes(customerSearch))
    );

    return (
        <div className={`w-full h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
            {/* Modern Header */}
            <motion.div
                className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 p-4 z-10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">RetailPOS Pro</h1>
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-400">Terminal #001</p>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-0">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                        Live
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <div>
                                        <p className="text-xs text-green-400">Today's Sales</p>
                                        <p className="text-sm font-bold text-white">{salesStats.todaySales}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-blue-400" />
                                    <div>
                                        <p className="text-xs text-blue-400">Revenue</p>
                                        <p className="text-sm font-bold text-white">₵{salesStats.todayRevenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link href={`/dashboard/${storeId}/}`}>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>

                        <div className="flex items-center space-x-2 text-gray-300 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="font-mono text-sm font-medium">{currentTime.toLocaleTimeString()}</span>
                        </div>



                        <div className="flex items-center space-x-2 text-gray-300 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl">
                            <User className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium">{currentUser?.fullName || "Loading..."}</span>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                {currentUser?.role || "User"}
                            </Badge>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>

                        <Dialog open={showSettings} onOpenChange={setShowSettings}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
                                >
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-white">POS Settings</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm">Sound Effects</span>
                                            <Button
                                                variant={tempSettings.soundEffects ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTempSettings(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
                                                className="h-8 px-3"
                                            >
                                                {tempSettings.soundEffects ? "On" : "Off"}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm">Auto Print Receipt</span>
                                            <Button
                                                variant={tempSettings.autoReceiptPrint ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTempSettings(prev => ({ ...prev, autoReceiptPrint: !prev.autoReceiptPrint }))}
                                                className="h-8 px-3"
                                            >
                                                {tempSettings.autoReceiptPrint ? "On" : "Off"}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm">Show Item Images</span>
                                            <Button
                                                variant={tempSettings.showItemImages ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTempSettings(prev => ({ ...prev, showItemImages: !prev.showItemImages }))}
                                                className="h-8 px-3"
                                            >
                                                {tempSettings.showItemImages ? "On" : "Off"}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm">Barcode Scanning</span>
                                            <Button
                                                variant={tempSettings.barcodeScanning ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTempSettings(prev => ({ ...prev, barcodeScanning: !prev.barcodeScanning }))}
                                                className="h-8 px-3"
                                            >
                                                {tempSettings.barcodeScanning ? "On" : "Off"}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm">Compact Mode</span>
                                            <Button
                                                variant={tempSettings.compactMode ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTempSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                                                className="h-8 px-3"
                                            >
                                                {tempSettings.compactMode ? "On" : "Off"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <div className="space-y-2">
                                            <Label className="text-white text-sm">Default Tax Rate (%)</Label>
                                            <Input
                                                type="number"
                                                value={tempSettings.defaultTaxRate * 100}
                                                onChange={(e) => setTempSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) / 100 || 0 }))}
                                                className="bg-white/10 border-white/20 text-white"
                                                placeholder="8.5"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 pt-4">
                                        <Button
                                            onClick={() => setShowSettings(false)}
                                            variant="outline"
                                            className="flex-1 border-white/20 !text-gray-300"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await updateStoreSettings(storeId, {
                                                        posSettings: tempSettings
                                                    });
                                                    await refreshSettings();
                                                    soundManager.setEnabled(tempSettings.soundEffects);
                                                    toast.success("Settings saved successfully");
                                                    setShowSettings(false);
                                                } catch (error) {
                                                    toast.error("Failed to save settings");
                                                }
                                            }}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </motion.div>

            <div className="flex h-[calc(100vh-100px)]">
                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-1 shadow-lg">
                                        <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:!text-white text-gray-300 hover:!text-white rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10">
                                            <Package className="w-4 h-4 mr-2" />
                                            Products
                                        </TabsTrigger>
                                        <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 data-[state=active]:!text-white text-gray-300 hover:!text-white rounded-xl px-6 py-3 transition-all duration-300 hover:bg-white/10">
                                            <Star className="w-4 h-4 mr-2" />
                                            Services
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25 !text-white' : 'hover:bg-white/10 text-gray-300 hover:!text-white'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25 !text-white' : 'hover:bg-white/10 text-gray-300 hover:!text-white'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Dialog open={showCustomer} onOpenChange={setShowCustomer}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-white/20 text-gray-500 hover:!text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/40 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                                            <Users className="w-4 h-4 mr-2" />
                                            {selectedCustomer ? selectedCustomer.name : "Customer"}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Select Customer</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                placeholder="Search customers..."
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                            />
                                            <div className="max-h-60 overflow-auto space-y-2">
                                                {filteredCustomers.map((customer) => (
                                                    <div key={customer._id}
                                                        onClick={() => selectCustomer(customer)}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer border border-white/10">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-white font-medium">{customer.name}</p>
                                                                {customer.email && <p className="text-gray-400 text-sm">{customer.email}</p>}
                                                                {customer.phone && <p className="text-gray-400 text-sm">{customer.phone}</p>}
                                                            </div>
                                                            <Badge className="bg-blue-500/20 text-blue-400">
                                                                {customer.loyaltyPoints} pts
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                onClick={() => setShowNewCustomer(true)}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Add New Customer
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>



                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-white/20 text-gray-500 hover:!text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-400/40 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/25">
                                            <Scan className="w-4 h-4 mr-2" />
                                            Scan
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Barcode Scanner</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-white mb-2 block">Enter Barcode</Label>
                                                <Input
                                                    placeholder="Scan or enter barcode..."
                                                    value={barcodeInput}
                                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleBarcodeSearch}
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                                            >
                                                <Search className="w-4 h-4 mr-2" />
                                                Search Product
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="relative flex-1 p-6 space-y-4 z-10">
                        {/* Search */}
                        <div className="flex space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl"
                                />
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-white/20 !text-gray-500 hover:!text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
                                        <Barcode className="w-4 h-4 mr-2" />
                                        Scan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Quick Barcode Scan</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Scan barcode here..."
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                                            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                        />
                                        <Button
                                            onClick={handleBarcodeSearch}
                                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                        >
                                            Add to Cart
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Categories */}
                        <div className="flex space-x-2">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-xl transition-all duration-300 ${selectedCategory === category
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 !text-white"
                                        : "border-white/20 !text-gray-500 hover:!text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:border-white/30"
                                        }`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        {/* Products Grid/List */}
                        {loading ? (
                            <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                                <div className="text-white">Loading products...</div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
                                <Package className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
                                <p className="text-gray-400 mb-4">There are no products available in this category.</p>
                                <Button
                                    onClick={() => setSelectedCategory("All")}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                                >
                                    View All Products
                                </Button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-auto h-[calc(100vh-300px)]">
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Card
                                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all rounded-xl"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center text-2xl">
                                                    {posSettings.showItemImages ? (product.image || "📦") : "📦"}
                                                </div>
                                                <h3 className="text-white font-medium text-xs mb-1 truncate">{product.name}</h3>
                                                <div className="flex justify-between items-center mb-1">
                                                    <Badge variant="secondary" className="text-[10px] bg-white/10 px-1 py-0">{product.categoryId?.name || product.category}</Badge>
                                                    <span className="text-[10px] text-gray-400">{product.stock}</span>
                                                </div>
                                                <p className="text-green-400 font-bold text-sm">₵{product.price}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 overflow-auto h-[calc(100vh-300px)]">
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card
                                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all rounded-xl"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                                        {posSettings.showItemImages ? (product.image || "📦") : "📦"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-medium text-sm mb-1 truncate">{product.name}</h3>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="secondary" className="text-xs bg-white/10">{product.categoryId?.name || product.category}</Badge>
                                                            <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                                                        </div>
                                                        <p className="text-green-400 font-bold text-lg">₵{product.price}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(product);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart */}
                <div className="relative w-96 bg-black/25 backdrop-blur-xl border-l border-white/10 flex flex-col z-10">
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Cart ({cart.length})
                            </h2>
                            {cart.length > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleClearCart}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Cart is empty</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item._id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium text-sm">{item.name}</h4>
                                            <p className="text-gray-400 text-xs">₵{item.price} each</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(item._id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 rounded-lg transition-all duration-200 shadow-sm hover:shadow-red-500/25"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleQuantityChange(item._id, -1)}
                                                className="w-8 h-8 p-0 border-white/20 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/40 rounded-lg transition-all duration-200 shadow-sm hover:shadow-red-500/25 text-gray-500"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="text-white font-medium w-8 text-center bg-white/5 rounded-lg py-1">{item.quantity}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleQuantityChange(item._id, 1)}
                                                className="w-8 h-8 p-0 border-white/20 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/40 rounded-lg transition-all duration-200 shadow-sm hover:shadow-green-500/25 text-gray-500"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <span className="text-green-400 font-bold">
                                            ₵{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t border-white/10 p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal:</span>
                                    <span>₵{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-300 text-sm">Tax:</span>
                                        <div className="flex gap-1">
                                            <Select value={taxType} onValueChange={setTaxType}>
                                                <SelectTrigger className=" bg-white/10 border-white/20 text-white text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className=" border-white/20">
                                                    <SelectItem value="percentage">% Percentage</SelectItem>
                                                    <SelectItem value="fixed">$ Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={tax}
                                                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                                className="w-16 h-8 bg-white/10 border-white/20 text-white text-sm rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-gray-300 text-sm">Discount:</span>
                                        <div className="flex gap-1">
                                            <Select value={discountType} onValueChange={setDiscountType}>
                                                <SelectTrigger className=" bg-white/10 border-white/20 text-white text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className=" border-white/20">
                                                    <SelectItem value="percentage">%Percentage</SelectItem>
                                                    <SelectItem value="fixed">$Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={discount}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                className="w-16 h-8 bg-white/10 border-white/20 text-white text-sm rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {tax > 0 && (
                                    <div className="flex justify-between text-blue-400">
                                        <span>Tax ({taxType === 'percentage' ? tax + '%' : '$' + tax}):</span>
                                        <span>+₵{(taxType === 'percentage' ? (subtotal * tax) / 100 : tax).toFixed(2)}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount ({discountType === 'percentage' ? discount + '%' : '$' + discount}):</span>
                                        <span>-₵{(discountType === 'percentage' ? (subtotal * discount) / 100 : discount).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="border-t border-white/10 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-white">Total:</span>
                                        <span className="text-2xl font-bold text-green-400">₵{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                {selectedCustomer && (
                                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
                                        <div className="flex justify-between items-center text-blue-400 text-sm">
                                            <span>Customer: {selectedCustomer.name}</span>
                                            <span>{selectedCustomer.loyaltyPoints} pts</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!showPayment ? (
                                <div className="space-y-2">
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02]"
                                        onClick={() => { setShowPayment(true); setPaymentMethod("card"); }}
                                    >
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Pay with Card
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/20 text-white hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-400/40 py-3 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                                        onClick={() => { setShowPayment(true); setPaymentMethod("cash"); }}
                                    >
                                        <DollarSign className="w-5 h-5 mr-2" />
                                        Cash Payment
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-white font-medium mb-2">
                                            {paymentMethod === "card" ? "Card Payment" : "Cash Payment"}
                                        </p>
                                        <p className="text-2xl font-bold text-green-400">₵{total.toFixed(2)}</p>
                                        {paymentMethod === "cash" && amountReceived && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                Change: ₵{Math.max(0, parseFloat(amountReceived) - total).toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    {paymentMethod === "cash" && (
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Amount Received:</label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={amountReceived}
                                                onChange={(e) => setAmountReceived(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white rounded-xl"
                                            />
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/20 !text-gray-300 hover:!text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:border-red-400/40 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                                            onClick={() => setShowPayment(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02]"
                                            onClick={processPayment}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Complete
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* New Customer Dialog */}
            <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
                <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white mb-2 block">Name *</Label>
                            <Input
                                placeholder="Customer name"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-white mb-2 block">Email *</Label>
                            <Input
                                type="email"
                                placeholder="customer@example.com"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-white mb-2 block">Phone</Label>
                            <Input
                                placeholder="+1234567890"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setShowNewCustomer(false)}
                                variant="outline"
                                className="flex-1 border-white/20 !text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={addNewCustomer}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                            >
                                Add Customer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Receipt Dialog */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Receipt</DialogTitle>
                    </DialogHeader>
                    {lastSale && (
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-lg p-4 space-y-2">
                                <div className="text-center border-b border-white/10 pb-2">
                                    <h3 className="text-white font-bold">RetailPOS Pro</h3>
                                    <p className="text-gray-400 text-sm">{lastSale.timestamp.toLocaleString()}</p>
                                    <p className="text-gray-400 text-sm">Receipt #{lastSale.id}</p>
                                </div>

                                {lastSale.customer && (
                                    <div className="border-b border-white/10 pb-2">
                                        <p className="text-white text-sm">Customer: {lastSale.customer.name}</p>
                                        <p className="text-gray-400 text-xs">{lastSale.customer.email}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {lastSale.items.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-white">{item.name} x{item.quantity}</span>
                                            <span className="text-gray-300">₵{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-2 space-y-1">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Subtotal:</span>
                                        <span>₵{lastSale.subtotal.toFixed(2)}</span>
                                    </div>
                                    {lastSale.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-400">
                                            <span>Discount:</span>
                                            <span>-₵{lastSale.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Tax:</span>
                                        <span>₵{lastSale.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white">
                                        <span>Total:</span>
                                        <span>₵{lastSale.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Payment:</span>
                                        <span>{lastSale.paymentMethod}</span>
                                    </div>
                                    {lastSale.change > 0 && (
                                        <div className="flex justify-between text-sm text-blue-400">
                                            <span>Change:</span>
                                            <span>₵{lastSale.change.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center text-xs text-gray-400 border-t border-white/10 pt-2">
                                    <p>Thank you for your business!</p>
                                    <p>Visit us again soon</p>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    onClick={printReceipt}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    onClick={saveTransaction}
                                    variant="outline"
                                    className="flex-1 border-white/20 !text-gray-300"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Product Variation Dialog */}
            <ProductVariationDialog
                product={selectedProduct}
                open={showVariationDialog}
                onOpenChange={setShowVariationDialog}
                onSelectVariation={handleVariationSelect}
            />
        </div>
    );
}