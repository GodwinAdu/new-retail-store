"use client";

import { useState, useEffect } from "react";
import { Package, Plus, X, Truck, ArrowLeft, FileText, DollarSign, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder } from "@/lib/actions/purchase-order.actions";
import { getSuppliers } from "@/lib/actions/supplier.actions";
import { getProducts } from "@/lib/actions/product.actions";
import { toast } from "sonner";

export default function PurchaseOrdersPage({ storeId, userId }: { storeId: string; userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    const [ordersData, suppliersData, productsData] = await Promise.all([
      getPurchaseOrders(storeId),
      getSuppliers(storeId),
      getProducts(storeId)
    ]);
    setOrders(ordersData);
    setSuppliers(suppliersData);
    setProducts(productsData);
    setLoading(false);
  };

  const handleCreatePO = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
    const tax = subtotal * 0.075;

    const result = await createPurchaseOrder(storeId, {
      supplierId: formData.get("supplierId"),
      items: selectedItems,
      subtotal, tax, total: subtotal + tax,
      expectedDeliveryDate: formData.get("expectedDeliveryDate"),
      notes: formData.get("notes"),
      createdBy: userId
    });

    if (result?.success) {
      toast.success("Purchase order created");
      setDialogOpen(false);
      setSelectedItems([]);
      loadData();
    } else {
      toast.error(result?.error || "Failed to create purchase order");
    }
  };

  const handleReceive = async (poId: string) => {
    if (confirm("Mark this purchase order as received?")) {
      const result = await receivePurchaseOrder(storeId, poId, userId);
      if (result?.success) {
        toast.success("Purchase order received, stock updated");
        loadData();
      } else {
        toast.error(result?.error || "Failed to receive purchase order");
      }
    }
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: "", name: "", quantity: 1, costPrice: 0, receivedQuantity: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    if (field === "productId") {
      const product = products.find(p => p._id === value);
      if (product) {
        updated[index].name = product.name;
        updated[index].costPrice = product.costPrice || product.price;
      }
    }
    setSelectedItems(updated);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-blue-100 text-blue-700",
      received: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-red-100 text-red-700"
    };
    return map[status] || map.draft;
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "approved").length;
  const receivedOrders = orders.filter(o => o.status === "received").length;
  const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/70 rounded-2xl p-6 shadow-lg">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
      <div className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href={`/dashboard/${storeId}/inventory`}>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Inventory
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-500 mt-1">Manage supplier orders and stock receiving</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Purchase Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePO} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Supplier</Label>
                      <Select name="supplierId" required>
                        <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => (
                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expected Delivery</Label>
                      <Input type="date" name="expectedDeliveryDate" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Items</Label>
                      <Button type="button" size="sm" variant="outline" onClick={addItem}>
                        <Plus className="w-3 h-3 mr-1" />Add Item
                      </Button>
                    </div>
                    {selectedItems.length === 0 && (
                      <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Click "Add Item" to add products</p>
                      </div>
                    )}
                    {selectedItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                        <div className="col-span-5">
                          <Select value={item.productId} onValueChange={(v) => updateItem(i, "productId", v)} required>
                            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                            <SelectContent>
                              {products.map(p => (
                                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 0)} className="col-span-2" required />
                        <Input type="number" step="0.01" placeholder="Cost" value={item.costPrice} onChange={(e) => updateItem(i, "costPrice", parseFloat(e.target.value) || 0)} className="col-span-3" required />
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">GH₵{(item.quantity * item.costPrice).toFixed(2)}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {selectedItems.length > 0 && (
                      <div className="flex justify-end pt-2 border-t mt-3">
                        <span className="text-sm font-semibold text-gray-900">
                          Subtotal: GH₵{selectedItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Input name="notes" placeholder="Optional notes..." />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
                      Create Purchase Order
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                  <FileText className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Received</p>
                    <p className="text-2xl font-bold text-gray-900">{receivedOrders}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">GH₵{totalValue.toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">All Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No purchase orders yet</p>
                  <p className="text-sm mt-1">Create your first purchase order to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 font-semibold">{order.poNumber}</h3>
                          <p className="text-sm text-gray-500">{order.supplierId?.name || "Unknown Supplier"}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusBadge(order.status)} border-0`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {order.status === "approved" && (
                            <Button size="sm" onClick={() => handleReceive(order._id)} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                              <Truck className="w-4 h-4 mr-1" />Receive
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <span className="text-gray-900 ml-2 font-medium">{order.items.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <span className="text-gray-900 ml-2 font-medium">GH₵{order.total.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected:</span>
                          <span className="text-gray-900 ml-2 font-medium">
                            {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
