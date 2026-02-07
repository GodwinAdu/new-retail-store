"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, ShoppingCart, Calendar, Eye, Download, Search, Filter, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SaleDetailsDialog from "@/components/SaleDetailsDialog";
import CreateSaleDialog from "@/components/CreateSaleDialog";
import { getSales, getSaleStats } from "@/lib/actions/sale.actions";
import { ISale } from "@/lib/types";

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

export default function SalesClient({ storeId,  initialSales, initialStats }: SalesClientProps) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const today = new Date();
  
  const [sales, setSales] = useState<ISale[]>(initialSales);
  const [stats, setStats] = useState(initialStats);
  const [filteredSales, setFilteredSales] = useState<ISale[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
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
    const [newSales, newStats] = await Promise.all([
      getSales(storeId,  50, startDate, endDate),
      getSaleStats(storeId,  startDate, endDate)
    ]);
    setSales(newSales);
    setStats(newStats);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [startDate, endDate]);

  const handleViewDetails = (saleId: string) => {
    setSelectedSaleId(saleId);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      case 'refunded': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const exportSales = () => {
    const csvContent = [
      ['Sale ID', 'Customer', 'Items', 'Total', 'Status', 'Date'],
      ...filteredSales.map(sale => [
        sale.saleNumber,
        sale.customerName || 'Walk-in Customer',
        sale.items.length.toString(),
        sale.total.toFixed(2),
        sale.status,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href={`/dashboard/${storeId}`}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white">Sales Management</h1>
              <p className="text-gray-300 mt-1">Track and manage all sales transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white w-40"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white w-40"
                />
              </div>
              <CreateSaleDialog 
                storeId={storeId}
                onSaleCreated={refreshData}
              />
              <Button 
                variant="outline" 
                onClick={exportSales}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Period Sales</p>
                    <p className="text-2xl font-bold text-white">GH₵{stats.todayRevenue.toFixed(0)}</p>
                    <p className={`text-sm ${stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.revenueGrowth > 0 ? formatGrowth(stats.revenueGrowth) : 'Selected period'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Transactions</p>
                    <p className="text-2xl font-bold text-white">{stats.todayTransactions}</p>
                    <p className={`text-sm ${stats.transactionGrowth >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatGrowth(stats.transactionGrowth)} from yesterday
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Average Sale</p>
                    <p className="text-2xl font-bold text-white">GH₵{stats.avgSale.toFixed(0)}</p>
                    <p className="text-purple-400 text-sm">Per transaction</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">
                      GH₵{stats.thisMonthRevenue >= 1000 
                        ? `${(stats.thisMonthRevenue / 1000).toFixed(1)}K` 
                        : stats.thisMonthRevenue.toFixed(2)}
                    </p>
                    <p className="text-orange-400 text-sm">Total revenue</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Sales</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search sales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
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
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3">Sale ID</th>
                      <th className="text-left text-gray-300 font-medium py-3">Customer</th>
                      <th className="text-left text-gray-300 font-medium py-3">Items</th>
                      <th className="text-left text-gray-300 font-medium py-3">Total</th>
                      <th className="text-left text-gray-300 font-medium py-3">Status</th>
                      <th className="text-left text-gray-300 font-medium py-3">Date</th>
                      <th className="text-left text-gray-300 font-medium py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale._id} className="border-b border-white/5">
                        <td className="py-4 text-white font-medium">#{sale.saleNumber}</td>
                        <td className="py-4">
                          <div>
                            <p className="text-gray-300">{sale.customerName || 'Walk-in Customer'}</p>
                            {sale.customerPhone && (
                              <p className="text-gray-400 text-sm">{sale.customerPhone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-white">{sale.items.length}</td>
                        <td className="py-4 text-white font-medium">GH₵{sale.total.toFixed(2)}</td>
                        <td className="py-4">
                          <Badge className={`${getStatusColor(sale.status)} border-0`}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 text-gray-300">
                          {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => handleViewDetails(sale._id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSales.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    {searchTerm || statusFilter !== "all" ? "No sales found matching your criteria." : "No sales found."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SaleDetailsDialog
        saleId={selectedSaleId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onSaleUpdated={refreshData}
      />
    </div>
  );
}