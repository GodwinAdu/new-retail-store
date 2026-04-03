"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Package, AlertCircle, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getABCAnalysis, getInventoryTurnover, getStockAgingReport, getDeadStockAnalysis } from "@/lib/actions/inventory-reports.actions";

export default function InventoryReportsClient({ storeId }: { storeId: string }) {
  const [abcData, setAbcData] = useState<any[]>([]);
  const [turnoverData, setTurnoverData] = useState<any[]>([]);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [deadStock, setDeadStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    const [abc, turnover, aging, dead] = await Promise.all([
      getABCAnalysis(storeId),
      getInventoryTurnover(storeId, 30),
      getStockAgingReport(storeId),
      getDeadStockAnalysis(storeId, 90)
    ]);
    setAbcData(abc);
    setTurnoverData(turnover);
    setAgingData(aging);
    setDeadStock(dead);
    setLoading(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      A: "bg-emerald-100 text-emerald-700",
      B: "bg-amber-100 text-amber-700",
      C: "bg-red-100 text-red-700"
    };
    return colors[category] || colors.C;
  };

  const getTurnoverColor = (status: string) => {
    const colors: any = {
      fast: "bg-emerald-100 text-emerald-700",
      medium: "bg-amber-100 text-amber-700",
      slow: "bg-red-100 text-red-700"
    };
    return colors[status] || colors.slow;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
      <div className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link href={`/dashboard/${storeId}/inventory`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Inventory
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
              <p className="text-gray-500 mt-1">Advanced analytics and insights</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>

          <Tabs defaultValue="abc" className="space-y-6">
            <TabsList className="bg-white/80 border border-gray-200 p-1 grid w-full grid-cols-2 sm:grid-cols-4 rounded-xl">
              <TabsTrigger value="abc" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">ABC</TabsTrigger>
              <TabsTrigger value="turnover" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">Turnover</TabsTrigger>
              <TabsTrigger value="aging" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">Aging</TabsTrigger>
              <TabsTrigger value="dead" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">Dead Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="abc">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-gray-900 flex items-center"><BarChart3 className="w-5 h-5 mr-2" />ABC Analysis</CardTitle>
                      <CardDescription className="mt-1">Products by revenue: A (80%), B (15%), C (5%)</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">A</Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-0">B</Badge>
                      <Badge className="bg-red-100 text-red-700 border-0">C</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-gray-500 font-medium py-3 px-4">Product</th>
                          <th className="text-left text-gray-500 font-medium py-3 px-4 hidden sm:table-cell">SKU</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Revenue</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4 hidden md:table-cell">Qty</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">%</th>
                          <th className="text-center text-gray-500 font-medium py-3 px-4">Cat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abcData.slice(0, 20).map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                            <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{item.sku}</td>
                            <td className="py-3 px-4 text-right text-gray-900 font-semibold">GH₵{item.totalRevenue.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-500 hidden md:table-cell">{item.totalQuantity}</td>
                            <td className="py-3 px-4 text-right text-gray-500">{item.revenuePercent.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-center"><Badge className={`${getCategoryColor(item.category)} border-0`}>{item.category}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {abcData.length === 0 && <div className="text-center py-12 text-gray-400">No sales data available</div>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="turnover">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Inventory Turnover (30 Days)</CardTitle>
                  <CardDescription className="mt-1">Product velocity analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-gray-500 font-medium py-3 px-4">Product</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4 hidden md:table-cell">Stock</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Sold</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4 hidden sm:table-cell">Days to Sell</th>
                          <th className="text-center text-gray-500 font-medium py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turnoverData.slice(0, 20).map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                            <td className="py-3 px-4 text-right text-gray-900 hidden md:table-cell">{item.currentStock}</td>
                            <td className="py-3 px-4 text-right text-gray-500">{item.soldQuantity}</td>
                            <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">{item.daysToSell}</td>
                            <td className="py-3 px-4 text-center"><Badge className={`${getTurnoverColor(item.status)} border-0`}>{item.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {turnoverData.length === 0 && <div className="text-center py-12 text-gray-400">No turnover data available</div>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aging">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center"><Package className="w-5 h-5 mr-2" />Stock Aging Report</CardTitle>
                  <CardDescription className="mt-1">Time products have been in stock</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-gray-500 font-medium py-3 px-4">Product</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4 hidden md:table-cell">Stock</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Value</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Days</th>
                          <th className="text-center text-gray-500 font-medium py-3 px-4 hidden sm:table-cell">Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agingData.slice(0, 20).map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                            <td className="py-3 px-4 text-right text-gray-900 hidden md:table-cell">{item.stock}</td>
                            <td className="py-3 px-4 text-right text-gray-900 font-semibold">GH₵{item.stockValue.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-500">{item.daysSinceCreated}</td>
                            <td className="py-3 px-4 text-center text-gray-500 text-sm hidden sm:table-cell">{item.ageCategory}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {agingData.length === 0 && <div className="text-center py-12 text-gray-400">No aging data available</div>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dead">
              <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />Dead Stock (90+ Days)</CardTitle>
                  <CardDescription className="mt-1">Products with no recent sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-gray-500 font-medium py-3 px-4">Product</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Stock</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4">Value</th>
                          <th className="text-right text-gray-500 font-medium py-3 px-4 hidden sm:table-cell">Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deadStock.map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                            <td className="py-3 px-4 text-right text-red-600 font-semibold">{item.stock}</td>
                            <td className="py-3 px-4 text-right text-red-600 font-semibold">GH₵{item.stockValue.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">{item.daysSinceLastSale}+</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {deadStock.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-emerald-600 text-lg font-semibold mb-2">✓ No Dead Stock</div>
                        <p className="text-gray-500">All products have recent sales</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
