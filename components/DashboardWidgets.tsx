"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Package, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface InventoryAlert {
  _id: string;
  name: string;
  stock: number;
  minStock: number;
  reorderPoint: number;
  expiryDate?: string;
  isPerishable: boolean;
}

interface TopProduct {
  _id: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface RevenueSummary {
  _id: string;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
}

export function InventoryAlertsWidget({ storeId, branchId }: { storeId: string; branchId?: string }) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [storeId, branchId]);

  const fetchAlerts = async () => {
    try {
      const { getLowStockAlerts, getExpiringProducts } = await import("@/lib/actions/inventory.actions");
      const [lowStock, expiring] = await Promise.all([
        getLowStockAlerts(storeId),
        getExpiringProducts(storeId)
      ]);
      setAlerts([...lowStock, ...expiring]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading alerts...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground">No alerts at this time</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{alert.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {alert.stock} / Min: {alert.minStock}
                  </p>
                </div>
                <Badge variant={alert.stock <= alert.minStock ? "destructive" : "secondary"}>
                  {alert.stock <= alert.minStock ? "Low Stock" : "Expiring Soon"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopSellingWidget({ storeId, branchId }: { storeId: string; branchId?: string }) {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, [storeId, branchId]);

  const fetchTopProducts = async () => {
    try {
      const { getTopSellingProducts } = await import("@/lib/actions/inventory.actions");
      const products = await getTopSellingProducts(storeId, 5);
      setTopProducts(products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top products:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading top products...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <p className="text-muted-foreground">No sales data available</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.totalQuantity} sold
                    </p>
                  </div>
                </div>
                <p className="font-semibold">${product.totalRevenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueSummaryWidget({ storeId, branchId }: { storeId: string; branchId?: string }) {
  const [revenue, setRevenue] = useState<RevenueSummary[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [storeId, branchId, period]);

  const fetchRevenue = async () => {
    try {
      const { getRevenueSummary } = await import("@/lib/actions/inventory.actions");
      const data = await getRevenueSummary(storeId, period);
      setRevenue(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading revenue data...</div>;

  const totalRevenue = revenue.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalSales = revenue.reduce((sum, item) => sum + item.totalSales, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          Revenue Summary
        </CardTitle>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded ${
                period === p ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{totalSales}</p>
          </div>
        </div>
        
        {revenue.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent {period} data:</p>
            {revenue.slice(0, 3).map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item._id}</span>
                <span>${item.totalRevenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OfflineStatusWidget({ storeId, branchId }: { storeId: string; branchId?: string }) {
  const [status, setStatus] = useState({ pending: 0, synced: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [storeId, branchId]);

  const fetchStatus = async () => {
    try {
      const { getOfflineSalesStatus } = await import("@/lib/actions/offline.actions");
      const data = await getOfflineSalesStatus(storeId, branchId);
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offline status:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading offline status...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Offline Sales Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{status.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{status.synced}</p>
            <p className="text-sm text-muted-foreground">Synced</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{status.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>
        
        {status.pending > 0 && (
          <button 
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={async () => {
              try {
                const { syncOfflineSales } = await import("@/lib/actions/offline.actions");
                await syncOfflineSales(storeId, branchId);
                fetchStatus(); // Refresh status
              } catch (error) {
                console.error("Sync failed:", error);
              }
            }}
          >
            Sync Pending Sales
          </button>
        )}
      </CardContent>
    </Card>
  );
}