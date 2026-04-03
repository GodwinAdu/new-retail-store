"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createSale } from "@/lib/actions/sale.actions";
import { getProducts } from "@/lib/actions/product.actions";
import { getCustomers } from "@/lib/actions/customer.actions";
import { IProduct, ICustomer } from "@/lib/types";
import { toast } from "sonner";

interface CreateSaleDialogProps {
  storeId: string;
  onSaleCreated: () => void;
}

export default function CreateSaleDialog({ storeId, onSaleCreated }: CreateSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [formData, setFormData] = useState({ customerId: "walk-in", productId: "", quantity: "1", paymentMethod: "cash" });

  useEffect(() => {
    if (open) {
      Promise.all([getProducts(storeId), getCustomers(storeId)]).then(([p, c]) => { setProducts(p); setCustomers(c); });
    }
  }, [open]);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(products.find(p => p._id === productId) || null);
    setFormData({ ...formData, productId });
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === "walk-in") { setSelectedCustomer(null); setFormData({ ...formData, customerId: "" }); }
    else { setSelectedCustomer(customers.find(c => c._id === customerId) || null); setFormData({ ...formData, customerId }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { toast.error("Please select a product"); return; }
    const quantity = parseInt(formData.quantity);
    const subtotal = selectedProduct.price * quantity;
    const tax = subtotal * 0.1;

    setLoading(true);
    const result = await createSale(storeId, {
      customerId: selectedCustomer?._id, customerName: selectedCustomer?.name, customerPhone: selectedCustomer?.phone,
      items: [{ productId: selectedProduct._id, name: selectedProduct.name, price: selectedProduct.price, quantity, discount: 0 }],
      subtotal, tax, discount: 0, total: subtotal + tax, paymentMethod: formData.paymentMethod
    });

    if (result.success) {
      toast.success("Sale created");
      setFormData({ customerId: "walk-in", productId: "", quantity: "1", paymentMethod: "cash" });
      setSelectedProduct(null); setSelectedCustomer(null); setOpen(false); onSaleCreated();
    } else toast.error(result.error || "Failed to create sale");
    setLoading(false);
  };

  const qty = parseInt(formData.quantity || "1");
  const subtotal = selectedProduct ? selectedProduct.price * qty : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />Quick Sale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Quick Sale</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer (Optional)</Label>
            <Select value={formData.customerId || "walk-in"} onValueChange={handleCustomerChange}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                {customers.map(c => <SelectItem key={c._id} value={c._id}>{c.name} {c.phone && `(${c.phone})`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Product *</Label>
            <Select value={formData.productId} onValueChange={handleProductChange}>
              <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
              <SelectContent>
                {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} — GH₵{p.price.toFixed(2)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {selectedProduct && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-900 font-medium">{selectedProduct.name}</p>
              <p className="text-gray-500 text-sm">Price: GH₵{selectedProduct.price.toFixed(2)} · Stock: {selectedProduct.stock}</p>
            </div>
          )}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min="1" max={selectedProduct?.stock || 999} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
          </div>
          {selectedProduct && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="text-gray-900">GH₵{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax (10%):</span><span className="text-gray-900">GH₵{(subtotal * 0.1).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold border-t border-emerald-200 pt-1 mt-1"><span className="text-gray-900">Total:</span><span className="text-emerald-700">GH₵{(subtotal * 1.1).toFixed(2)}</span></div>
            </div>
          )}
          <div>
            <Label>Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !selectedProduct} className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
