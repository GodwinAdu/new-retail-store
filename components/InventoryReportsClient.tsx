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

  useEffect(() => {
    loadData();
  }, [storeId]);

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
      A: "bg-green-500/20 text-green-400 border-green-500/30",
      B: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      C: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[category] || colors.C;
  };

  const getTurnoverColor = (status: string) => {
    const colors: any = {
      fast: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      slow: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[status] || colors.slow;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href={`/dashboard/${storeId}/inventory`}>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Inventory Reports</h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">Advanced analytics and insights</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <Tabs defaultValue="abc" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20 p-1 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="abc" className="data-[state=active]:bg-white/20">ABC</TabsTrigger>
          <TabsTrigger value="turnover" className="data-[state=active]:bg-white/20">Turnover</TabsTrigger>
          <TabsTrigger value="aging" className="data-[state=active]:bg-white/20">Aging</TabsTrigger>
          <TabsTrigger value="dead" className="data-[state=active]:bg-white/20">Dead Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="abc" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center text-xl">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    ABC Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-300 mt-1 text-sm">
                    Products by revenue: A (80%), B (15%), C (5%)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">A</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">B</Badge>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">C</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3 px-2 sm:px-4">Product</th>
                      <th className="text-left text-gray-300 font-medium py-3 px-2 sm:px-4 hidden sm:table-cell">SKU</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Revenue</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4 hidden md:table-cell">Qty</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">%</th>
                      <th className="text-center text-gray-300 font-medium py-3 px-2 sm:px-4">Cat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abcData.slice(0, 20).map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white font-medium text-sm sm:text-base">{item.productName}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-300 text-sm hidden sm:table-cell">{item.sku}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-white font-semibold text-sm sm:text-base">${item.totalRevenue.toFixed(2)}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm hidden md:table-cell">{item.totalQuantity}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm sm:text-base">{item.revenuePercent.toFixed(1)}%</td>
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {abcData.length === 0 && (
                  <div className="text-center py-12 text-gray-300">
                    No sales data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnover" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <TrendingUp className="w-5 h-5 mr-2" />
                Inventory Turnover (30 Days)
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1 text-sm">
                Product velocity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3 px-2 sm:px-4">Product</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4 hidden md:table-cell">Stock</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Sold</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4 hidden sm:table-cell">Days</th>
                      <th className="text-center text-gray-300 font-medium py-3 px-2 sm:px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnoverData.slice(0, 20).map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white font-medium text-sm sm:text-base">{item.productName}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-white text-sm sm:text-base hidden md:table-cell">{item.currentStock}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm sm:text-base">{item.soldQuantity}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm sm:text-base hidden sm:table-cell">{item.daysToSell}</td>
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <Badge className={getTurnoverColor(item.status)}>{item.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {turnoverData.length === 0 && (
                  <div className="text-center py-12 text-gray-300">
                    No turnover data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <Package className="w-5 h-5 mr-2" />
                Stock Aging Report
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1 text-sm">
                Time products have been in stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3 px-2 sm:px-4">Product</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4 hidden md:table-cell">Stock</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Value</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Days</th>
                      <th className="text-center text-gray-300 font-medium py-3 px-2 sm:px-4 hidden sm:table-cell">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agingData.slice(0, 20).map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white font-medium text-sm sm:text-base">{item.productName}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-white text-sm sm:text-base hidden md:table-cell">{item.stock}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-white font-semibold text-sm sm:text-base">${item.stockValue.toFixed(2)}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm sm:text-base">{item.daysSinceCreated}</td>
                        <td className="py-3 px-2 sm:px-4 text-center text-gray-300 text-xs sm:text-sm hidden sm:table-cell">{item.ageCategory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agingData.length === 0 && (
                  <div className="text-center py-12 text-gray-300">
                    No aging data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dead" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-xl">
                <AlertCircle className="w-5 h-5 mr-2" />
                Dead Stock (90+ Days)
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1 text-sm">
                Products with no recent sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 font-medium py-3 px-2 sm:px-4">Product</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Stock</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4">Value</th>
                      <th className="text-right text-gray-300 font-medium py-3 px-2 sm:px-4 hidden sm:table-cell">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deadStock.map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white font-medium text-sm sm:text-base">{item.productName}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-red-400 font-semibold text-sm sm:text-base">{item.stock}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-red-400 font-semibold text-sm sm:text-base">${item.stockValue.toFixed(2)}</td>
                        <td className="py-3 px-2 sm:px-4 text-right text-gray-300 text-sm sm:text-base hidden sm:table-cell">{item.daysSinceLastSale}+</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {deadStock.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-green-400 text-lg font-semibold mb-2">✓ No Dead Stock</div>
                    <p className="text-gray-300">All products have recent sales</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
