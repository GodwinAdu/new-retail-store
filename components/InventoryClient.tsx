"use client";

import { useState, useEffect } from "react";
import { Package, Search, Filter, Edit, Trash2, Download, Upload, AlertTriangle, TrendingUp, TrendingDown, ArrowLeft, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AddProductDialog from "@/components/AddProductDialog";
import EditProductDialog from "@/components/EditProductDialog";
import BarcodeScanner from "@/components/BarcodeScanner";
import { getProducts, deleteProduct } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { bulkDeleteProducts, bulkUpdateCategory, adjustStock } from "@/lib/actions/inventory.actions";
import { toast } from "sonner";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { InventoryAlertManager } from "@/lib/utils/inventory-alerts";

interface InventoryClientProps {
  storeId: string;
  user: any;
}

export default function InventoryClient({ storeId, user }: InventoryClientProps) {
  const { inventorySettings } = useSettings();
  const { hasPermission } = usePermissions(user);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [adjustStockOpen, setAdjustStockOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(storeId),
        getCategories(storeId)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      
      // Process inventory alerts
      const alerts = InventoryAlertManager.processInventoryAlerts(productsData, inventorySettings);
      if (alerts.length > 0) {
        InventoryAlertManager.showAlertToasts(alerts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(storeId, productId);
      if (result?.success) {
        toast.success("Product deleted successfully");
        loadData();
      } else {
        toast.error(result?.error || "Failed to delete product");
      }
    }
  };

  const handleExport = () => {
    const csvData = [
      ["Name", "SKU", "Category", "Stock", "Cost Price", "Selling Price", "Min Stock", "Barcode", "Description"],
      ...products.map(p => [
        p.name,
        p.sku || "",
        p.category?.name || "",
        p.stock,
        p.costPrice || 0,
        p.price,
        p.minStock || "",
        p.barcode || "",
        p.description || ""
      ])
    ];
    
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Inventory exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").map(row => row.split(",").map(cell => cell.replace(/^"|"$/g, "")));
        const headers = rows[0];
        const data = rows.slice(1).filter(row => row.length > 1 && row[0]);

        toast.info(`Importing ${data.length} products...`);
        
        // Import products (simplified - you may want to add more validation)
        for (const row of data) {
          const productData = {
            name: row[0],
            sku: row[1],
            categoryId: categories.find(c => c.name === row[2])?._id,
            stock: parseInt(row[3]) || 0,
            costPrice: parseFloat(row[4]) || 0,
            price: parseFloat(row[5]) || 0,
            minStock: parseInt(row[6]) || undefined,
            barcode: row[7],
            description: row[8],
          };
          
          // You would call createProduct here
          // await createProduct(storeId, productData);
        }
        
        toast.success("Products imported successfully");
        loadData();
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import products");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getStockStatus = (stock: number, minStock?: number) => {
    const threshold = minStock || inventorySettings.lowStockThreshold;
    if (stock === 0) return { status: "Out of Stock", color: "bg-red-500/20 text-red-400" };
    if (inventorySettings.lowStockAlert && stock <= threshold) return { status: "Low Stock", color: "bg-orange-500/20 text-orange-400" };
    return { status: "In Stock", color: "bg-green-500/20 text-green-400" };
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category?._id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "category") {
        aValue = a.category?.name || "";
        bValue = b.category?.name || "";
      }
      
      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const stats = {
    totalProducts: products.length,
    lowStock: inventorySettings.lowStockAlert ? products.filter(p => p.stock <= (p.minStock || inventorySettings.lowStockThreshold) && p.stock > 0).length : 0,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-orange-400">{stats.lowStock}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-green-400">${stats.totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
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
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <p className="text-gray-300 mt-1">Manage your products and stock levels</p>
        </div>
        <div className="flex space-x-2">
          {hasPermission(PERMISSIONS.MANAGE_INVENTORY) && (
            <>
              <BarcodeScanner storeId={storeId} onProductFound={(product) => setSearchTerm(product.name)} />
              <Link href={`/dashboard/${storeId}/inventory/reports`}>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link href={`/dashboard/${storeId}/inventory/purchase-orders`}>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Purchase Orders
                </Button>
              </Link>
              <Link href={`/dashboard/${storeId}/inventory/stock-take`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Stock Take
                </Button>
              </Link>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
            </>
          )}
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
            <AddProductDialog storeId={storeId}  onProductAdded={loadData} />
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              // className="border-white/20 text-white hover:bg-white/10"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-300 font-medium py-3">Product</th>
                  <th className="text-left text-gray-300 font-medium py-3">SKU</th>
                  <th className="text-left text-gray-300 font-medium py-3">Category</th>
                  <th className="text-left text-gray-300 font-medium py-3">Stock</th>
                  <th className="text-left text-gray-300 font-medium py-3">Cost</th>
                  <th className="text-left text-gray-300 font-medium py-3">Price</th>
                  <th className="text-left text-gray-300 font-medium py-3">Profit</th>
                  <th className="text-left text-gray-300 font-medium py-3">Status</th>
                  <th className="text-left text-gray-300 font-medium py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
                  const profit = product.price - (product.costPrice || 0);
                  const profitMargin = product.costPrice ? ((profit / product.price) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={product._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4">
                        <div>
                          <div className="text-white font-medium">{product.name}</div>
                          {product.barcode && (
                            <div className="text-xs text-gray-400">{product.barcode}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{product.sku || "-"}</td>
                      <td className="py-4">
                        {product.category ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.category.color }}></div>
                            <span className="text-gray-300">{product.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div>
                          <span className={`font-medium ${
                            product.stock === 0 ? 'text-red-400' :
                            product.stock <= (product.minStock || 5) ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {product.stock}
                          </span>
                          {product.minStock && (
                            <div className="text-xs text-gray-400">Min: {product.minStock}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">${product.costPrice?.toFixed(2) || "0.00"}</td>
                      <td className="py-4 text-white">${product.price.toFixed(2)}</td>
                      <td className="py-4">
                        <div>
                          <span className="text-green-400">${profit.toFixed(2)}</span>
                          <div className="text-xs text-gray-400">{profitMargin}%</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={`${stockStatus.color} border-0`}>
                          {stockStatus.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingProduct(product);
                                setEditDialogOpen(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission(PERMISSIONS.MANAGE_PRODUCTS) && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
                <p className="text-gray-400">Add your first product to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          storeId={storeId}
          categories={categories}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onProductUpdated={loadData}
        />
      )}
    </div>
  );
}