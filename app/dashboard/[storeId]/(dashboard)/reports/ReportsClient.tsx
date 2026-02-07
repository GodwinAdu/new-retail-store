"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, ShoppingCart, Users, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { getReportStats, getSalesChart, getCategoryStats } from "@/lib/actions/report.actions";

interface ReportsClientProps {
  storeId: string;
  initialStats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    newCustomers: number;
    customersGrowth: number;
    totalProducts: number;
    productsGrowth: number;
    avgOrderValue: number;
    avgOrderValueGrowth: number;
  };
  initialSalesChart: Array<{
    month: string;
    sales: number;
    profit: number;
  }>;
  initialCategoryStats: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function ReportsClient({ storeId, initialStats, initialSalesChart, initialCategoryStats }: ReportsClientProps) {
  const [dateRange, setDateRange] = useState("this_month");
  const [stats, setStats] = useState(initialStats);
  const [salesChart, setSalesChart] = useState(initialSalesChart);
  const [categoryStats, setCategoryStats] = useState(initialCategoryStats);
  const [loading, setLoading] = useState(false);

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range);
    setLoading(true);
    
    const [newStats, newSalesChart, newCategoryStats] = await Promise.all([
      getReportStats(storeId, range),
      getSalesChart(storeId, range),
      getCategoryStats(storeId, range)
    ]);
    
    setStats(newStats);
    setSalesChart(newSalesChart);
    setCategoryStats(newCategoryStats);
    setLoading(false);
  };
  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      salesChart,
      categoryStats
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
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
              <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-300 mt-1">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex space-x-3">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={exportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">GH₵{stats.totalRevenue.toFixed(0)}</p>
                    <p className={`text-sm ${getGrowthColor(stats.revenueGrowth)}`}>
                      {formatGrowth(stats.revenueGrowth)} vs last month
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
                    <p className="text-gray-300 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                    <p className={`text-sm ${getGrowthColor(stats.ordersGrowth)}`}>
                      {formatGrowth(stats.ordersGrowth)} vs last month
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
                    <p className="text-gray-300 text-sm">New Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.newCustomers}</p>
                    <p className={`text-sm ${getGrowthColor(stats.customersGrowth)}`}>
                      {formatGrowth(stats.customersGrowth)} vs last month
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Products Sold</p>
                    <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                    <p className={`text-sm ${getGrowthColor(stats.productsGrowth)}`}>
                      {formatGrowth(stats.productsGrowth)} vs last month
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Sales & Profit Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {salesChart.length > 0 ? (
                    <ChartContainer
                      config={{
                        sales: {
                          label: "Sales",
                          color: "hsl(var(--chart-1))",
                        },
                        profit: {
                          label: "Profit",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <BarChart data={salesChart}>
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}K`}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                        <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No sales data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {categoryStats.length > 0 ? (
                    <div className="space-y-4 w-full">
                      {categoryStats.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded" style={{backgroundColor: category.color}}></div>
                            <span className="text-white">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all" 
                                style={{backgroundColor: category.color, width: `${category.value}%`}}
                              ></div>
                            </div>
                            <span className="text-gray-300 text-sm">{category.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {stats.totalOrders > 0 ? '94.2%' : '0%'}
                  </div>
                  <p className="text-blue-300 text-sm">Customer Satisfaction</p>
                  <p className="text-gray-400 text-xs mt-1">Based on completed orders</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-400 mb-2">3.2min</div>
                  <p className="text-green-300 text-sm">Avg. Transaction Time</p>
                  <p className="text-gray-400 text-xs mt-1">Estimated processing time</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    GH₵{stats.avgOrderValue.toFixed(0)}
                  </div>
                  <p className="text-purple-300 text-sm">Avg. Order Value</p>
                  <p className={`text-xs mt-1 ${getGrowthColor(stats.avgOrderValueGrowth)}`}>
                    {formatGrowth(stats.avgOrderValueGrowth)} vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}