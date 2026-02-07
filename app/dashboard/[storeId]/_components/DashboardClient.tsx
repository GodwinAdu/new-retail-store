"use client"

import { Button } from "@/components/ui/button";
import { 
    Users, 
    ShoppingCart, 
    Package, 
    BarChart3, 
    DollarSign,
    TrendingUp,
    Bell,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Zap,
    Target,
    LogOut,
    CreditCard
} from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import { toast } from "sonner";
import BillingBanner from "./BillingBanner";

interface DashboardClientProps {
    params: {
        storeId: string;
    };
    user: any;
}

export default function DashboardClient({ params, user }: DashboardClientProps) {
    const { hasPermission, userRole } = usePermissions(user);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        return { from: firstDayOfMonth, to: endOfToday };
    });
    const [calendarOpen, setCalendarOpen] = useState(false);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await getDashboardData(params.storeId, dateRange.from, dateRange.to);
            setDashboardData(data);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [params.storeId, dateRange]);

    const handleDateRangeSelect = (range: any) => {
        if (range?.from) {
            const from = new Date(range.from);
            from.setHours(0, 0, 0, 0);
            const to = range.to ? new Date(range.to) : new Date(range.from);
            to.setHours(23, 59, 59, 999);
            setDateRange({ from, to });
        }
        setCalendarOpen(false);
    };

    const setQuickRange = (days: number) => {
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        const from = subDays(to, days - 1);
        from.setHours(0, 0, 0, 0);
        setDateRange({ from, to });
    };

    if (loading || !dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Modern Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Retail Dashboard</h1>
                                <p className="text-gray-600">Welcome back, {user.fullName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-gray-700">
                                        <CalendarDays className="w-4 h-4 mr-2" />
                                        {dateRange.from && dateRange.to && dateRange.from.getTime() === dateRange.to.getTime() 
                                            ? format(dateRange.from, "MMM dd, yyyy")
                                            : dateRange.from && dateRange.to
                                            ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                                            : "Select date range"
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <div className="p-3 border-b">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setQuickRange(1)}>Today</Button>
                                            <Button size="sm" variant="outline" onClick={() => setQuickRange(7)}>7 days</Button>
                                            <Button size="sm" variant="outline" onClick={() => setQuickRange(30)}>30 days</Button>
                                            <Button size="sm" variant="outline" onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                firstDay.setHours(0, 0, 0, 0);
                                                const endOfToday = new Date();
                                                endOfToday.setHours(23, 59, 59, 999);
                                                setDateRange({ from: firstDay, to: endOfToday });
                                            }}>This Month</Button>
                                        </div>
                                    </div>
                                    <CalendarComponent
                                        mode="range"
                                        selected={{ from: dateRange.from, to: dateRange.to }}
                                        onSelect={handleDateRangeSelect}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline" size="sm" className="relative">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </Button>
                            <Link href={`/dashboard/${params.storeId}/pos`}>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Open POS
                                </Button>
                            </Link>
                            <Link href={`/dashboard/${params.storeId}/settings`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                    const { signOut } = await import("@/lib/actions/auth.actions");
                                    await signOut();
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <BillingBanner storeId={params.storeId} />
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                +{dashboardData.sales.change}%
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.sales.today}</div>
                        <p className="text-gray-600 text-sm">Sales Count</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                                style={{width: `${Math.min(100, (dashboardData.sales.today / (dashboardData.sales.target || 50)) * 100)}%`}}
                            ></div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                +{dashboardData.revenue.change}%
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">GH₵{dashboardData.revenue.today.toLocaleString()}</div>
                        <p className="text-gray-600 text-sm">Total Revenue</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-1000" 
                                style={{width: `${Math.min(100, (dashboardData.revenue.today / (dashboardData.revenue.target || 10000)) * 100)}%`}}
                            ></div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex items-center text-red-600 text-sm font-medium">
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                                Low Stock
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.products.lowStock}</div>
                        <p className="text-gray-600 text-sm">Low Stock Items</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-orange-600 h-2 rounded-full transition-all duration-1000" 
                                style={{width: `${Math.min(100, (dashboardData.products.lowStock / (dashboardData.products.total || 100)) * 100)}%`}}
                            ></div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <Target className="w-4 h-4 mr-1" />
                                +{dashboardData.customers.new}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.customers.total}</div>
                        <p className="text-gray-600 text-sm">Total Customers</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                                style={{width: `${Math.min(100, (dashboardData.customers.total / (dashboardData.customers.goal || 1000)) * 100)}%`}}
                            ></div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Charts & Analytics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Performance Overview */}
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h3>
                            
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-600">{dashboardData.performance?.avgSaleTime || 3}min</div>
                                    <p className="text-blue-700 text-sm">Avg Sale Time</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600">{dashboardData.performance?.customerSatisfaction || 4.7}</div>
                                    <p className="text-green-700 text-sm">Customer Rating</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                    <div className="text-2xl font-bold text-purple-600">{dashboardData.staff.active}</div>
                                    <p className="text-purple-700 text-sm">Staff On Duty</p>
                                </div>
                            </div>

                            {/* Revenue Chart */}
                            <div className="h-64 bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-700">Weekly Revenue</h4>
                                    <div className="text-sm text-gray-500">Last 7 days</div>
                                </div>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dashboardData.performance?.weeklyRevenue || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`GH₵${value}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>

                        {/* Popular Products */}
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Products</h3>
                            <div className="space-y-4">
                                {dashboardData.popularProducts.length > 0 ? dashboardData.popularProducts.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-gray-50/50 rounded-xl border border-white/30">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.name}</p>
                                                <p className="text-gray-600 text-sm">{product.quantity} sold</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-green-600 font-medium">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            GH₵{product.revenue.toFixed(2)}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No sales in selected period</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Quick Actions & Activity */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {userRole.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {hasPermission(PERMISSIONS.VIEW_INVENTORY) && (
                                    <Link href={`/dashboard/${params.storeId}/inventory`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200">
                                            <Package className="w-5 h-5" />
                                            <span className="text-xs">Inventory</span>
                                        </Button>
                                    </Link>
                                )}
                                {hasPermission(PERMISSIONS.VIEW_CUSTOMERS) && (
                                    <Link href={`/dashboard/${params.storeId}/customers`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-green-50 hover:border-green-200">
                                            <Users className="w-5 h-5" />
                                            <span className="text-xs">Customers</span>
                                        </Button>
                                    </Link>
                                )}
                                {hasPermission(PERMISSIONS.VIEW_SALES) && (
                                    <Link href={`/dashboard/${params.storeId}/sales`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200">
                                            <DollarSign className="w-5 h-5" />
                                            <span className="text-xs">Sales</span>
                                        </Button>
                                    </Link>
                                )}
                                {hasPermission(PERMISSIONS.VIEW_STAFF) && (
                                    <Link href={`/dashboard/${params.storeId}/staff`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-orange-50 hover:border-orange-200">
                                            <Users className="w-5 h-5" />
                                            <span className="text-xs">Staff</span>
                                        </Button>
                                    </Link>
                                )}
                                {hasPermission(PERMISSIONS.VIEW_BILLING) && (
                                    <Link href={`/dashboard/${params.storeId}/billing`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-indigo-50 hover:border-indigo-200">
                                            <CreditCard className="w-5 h-5" />
                                            <span className="text-xs">Billing</span>
                                        </Button>
                                    </Link>
                                )}
                                {hasPermission(PERMISSIONS.VIEW_REPORTS) && (
                                    <Link href={`/dashboard/${params.storeId}/reports`}>
                                        <Button variant="outline" className="w-full h-16 flex-col space-y-2 hover:bg-red-50 hover:border-red-200">
                                            <BarChart3 className="w-5 h-5" />
                                            <span className="text-xs">Reports</span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Recent Sales</h3>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {dashboardData.recentSales.length > 0 ? dashboardData.recentSales.map((sale: any, index: number) => (
                                    <div key={sale._id || index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            sale.status === 'completed' ? 'bg-green-500' :
                                            sale.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                                        }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Sale #{sale.saleNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                GH₵{sale.total.toFixed(2)} • {new Date(sale.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No recent sales</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* System Status */}
                        <motion.div 
                            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">System Status</h3>
                                    <p className="text-green-700 text-sm">All systems operational</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">POS System</span>
                                    <span className="text-green-600 font-medium">Online</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">Inventory Sync</span>
                                    <span className="text-green-600 font-medium">Connected</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">Payment Gateway</span>
                                    <span className="text-green-600 font-medium">Active</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
