"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, ShoppingCart, CalendarDays, Eye, Download, Search, RefreshCw, ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import SaleDetailsDialog from "@/components/SaleDetailsDialog";
import CreateSaleDialog from "@/components/CreateSaleDialog";
import { getSales, getSaleStats } from "@/lib/actions/sale.actions";
import { ISale } from "@/lib/types";
import { format, subDays } from "date-fns";

interface SalesClientProps {
  storeId: string;
  initialSales: ISale[];
  initialStats: {
    todayRevenue: number;
    todayTransactions: number;
    avgSale: number;
    thisMonthRevenue: number;
    revenueGrowth: number;
    transactionGrowth: number;
  };
}

export default function SalesClient({ storeId, initialSales, initialStats }: SalesClientProps) {
  const [sales, setSales] = useState<ISale[]>(initialSales);
  const [stats, setStats] = useState(initialStats);
  const [filteredSales, setFilteredSales] = useState<ISale[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = subDays(to, 30);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let filtered = sales.filter(sale =>
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone?.includes(searchTerm)
    );
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }
    setFilteredSales(filtered);
  }, [sales, searchTerm, statusFilter]);

  const refreshData = async () => {
    setLoading(true);
    const startStr = dateRange.from.toISOString().split('T')[0];
    const endStr = dateRange.to.toISOString().split('T')[0];
    const [newSales, newStats] = await Promise.all([
      getSales(storeId, 50, startStr, endStr),
      getSaleStats(storeId, startStr, endStr)
    ]);
    setSales(newSales);
    setStats(newStats);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, [dateRange]);

  const handleDateRangeSelect = (range: any) => {
    if (range?.from) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = range.to ? new Date(range.to) : new Date(range.from);
      to.setHours(23, 59, 59, 999);
      setDateRange({ from, to });
    }
    if (range?.to) setCalendarOpen(false);
  };

  const setQuickRange = (days: number) => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = subDays(to, days - 1);
    from.setHours(0, 0, 0, 0);
    setDateRange({ from, to });
    setCalendarOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      cancelled: "bg-gray-100 text-gray-600",
      refunded: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-blue-100 text-blue-700";
  };

  const formatGrowth = (growth: number) => `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;

  const exportSales = () => {
    const csvContent = [
      ['Sale ID', 'Customer', 'Items', 'Total', 'Status', 'Date'],
      ...filteredSales.map(sale => [
        sale.saleNumber, sale.customerName || 'Walk-in Customer',
        sale.items.length.toString(), sale.total.toFixed(2), sale.status,
        new Date(sale.createdAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
      <div className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/dashboard/${storeId}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
              <p className="text-gray-500 mt-1">Track and manage all sales transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {format(dateRange.from, "MMM dd")} – {format(dateRange.to, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setQuickRange(1)}>Today</Button>
                    <Button size="sm" variant="outline" onClick={() => setQuickRange(7)}>7 days</Button>
                    <Button size="sm" variant="outline" onClick={() => setQuickRange(30)}>30 days</Button>
                    <Button size="sm" variant="outline" onClick={() => setQuickRange(90)}>90 days</Button>
                  </div>
                  <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to }} onSelect={handleDateRangeSelect} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
              <CreateSaleDialog storeId={storeId} onSaleCreated={refreshData} />
              <Button variant="outline" onClick={exportSales}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Period Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">GH₵{stats.todayRevenue.toFixed(0)}</p>
                    <p className={`text-sm ${stats.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stats.revenueGrowth > 0 ? formatGrowth(stats.revenueGrowth) : 'Selected period'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayTransactions}</p>
                    <p className={`text-sm ${stats.transactionGrowth >= 0 ? 'text-cyan-600' : 'text-red-500'}`}>
                      {formatGrowth(stats.transactionGrowth)} vs prior
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Average Sale</p>
                    <p className="text-2xl font-bold text-gray-900">GH₵{stats.avgSale.toFixed(0)}</p>
                    <p className="text-blue-600 text-sm">Per transaction</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      GH₵{stats.thisMonthRevenue >= 1000 ? `${(stats.thisMonthRevenue / 1000).toFixed(1)}K` : stats.thisMonthRevenue.toFixed(2)}
                    </p>
                    <p className="text-amber-600 text-sm">Total revenue</p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Recent Sales</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Search sales..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-56" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Sale ID</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Customer</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Items</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Total</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Status</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Date</th>
                      <th className="text-left text-gray-500 font-medium py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-4 px-2 text-gray-900 font-medium">#{sale.saleNumber}</td>
                        <td className="py-4 px-2">
                          <p className="text-gray-700">{sale.customerName || 'Walk-in Customer'}</p>
                          {sale.customerPhone && <p className="text-gray-400 text-sm">{sale.customerPhone}</p>}
                        </td>
                        <td className="py-4 px-2 text-gray-700">{sale.items.length}</td>
                        <td className="py-4 px-2 text-gray-900 font-medium">GH₵{sale.total.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <Badge className={`${getStatusBadge(sale.status)} border-0`}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-2 text-gray-500 text-sm">
                          {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700" onClick={() => { setSelectedSaleId(sale._id); setDetailsDialogOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSales.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">{searchTerm || statusFilter !== "all" ? "No sales found matching your criteria." : "No sales found."}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SaleDetailsDialog saleId={selectedSaleId} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} onSaleUpdated={refreshData} />
    </div>
  );
}
