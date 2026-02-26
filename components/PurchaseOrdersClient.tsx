"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Eye, Check, X, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, updatePurchaseOrder } from "@/lib/actions/purchase-order.actions";
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

  useEffect(() => {
    loadData();
  }, [storeId]);

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
      subtotal,
      tax,
      total: subtotal + tax,
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

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: "bg-gray-500/20 text-gray-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-blue-500/20 text-blue-400",
      received: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400"
    };
    return colors[status] || colors.draft;
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Purchase Orders</h1>
          <p className="text-gray-300 mt-1">Manage supplier orders and stock receiving</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Purchase Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-900 text-white border-white/20">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <Select name="supplierId" required>
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {suppliers.map(s => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input type="date" name="expectedDeliveryDate" className="bg-white/10 border-white/20" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Items</Label>
                  <Button type="button" size="sm" onClick={addItem}>Add Item</Button>
                </div>
                {selectedItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                    <Select value={item.productId} onValueChange={(v) => updateItem(i, "productId", v)} required>
                      <SelectTrigger className="col-span-5 bg-white/10 border-white/20">
                        <SelectValue placeholder="Product" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {products.map(p => (
                          <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value))} className="col-span-2 bg-white/10 border-white/20" required />
                    <Input type="number" step="0.01" placeholder="Cost" value={item.costPrice} onChange={(e) => updateItem(i, "costPrice", parseFloat(e.target.value))} className="col-span-3 bg-white/10 border-white/20" required />
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm">${(item.quantity * item.costPrice).toFixed(2)}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(i)} className="ml-2"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <Label>Notes</Label>
                <Input name="notes" className="bg-white/10 border-white/20" />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Purchase Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{order.poNumber}</h3>
                    <p className="text-sm text-gray-400">{order.supplierId?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    {order.status === "approved" && (
                      <Button size="sm" onClick={() => handleReceive(order._id)}>
                        <Truck className="w-4 h-4 mr-2" />Receive
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white ml-2">{order.items.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white ml-2">${order.total.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected:</span>
                    <span className="text-white ml-2">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
