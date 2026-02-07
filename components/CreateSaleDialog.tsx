"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Search } from "lucide-react";
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
  const [formData, setFormData] = useState({
    customerId: "walk-in",
    productId: "",
    quantity: "1",
    paymentMethod: "cash"
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    const [productsData, customersData] = await Promise.all([
      getProducts(storeId),
      getCustomers(storeId)
    ]);
    setProducts(productsData);
    setCustomers(customersData);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product || null);
    setFormData({ ...formData, productId });
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === "walk-in") {
      setSelectedCustomer(null);
      setFormData({ ...formData, customerId: "" });
    } else {
      const customer = customers.find(c => c._id === customerId);
      setSelectedCustomer(customer || null);
      setFormData({ ...formData, customerId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const quantity = parseInt(formData.quantity);
    const subtotal = selectedProduct.price * quantity;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    setLoading(true);
    const result = await createSale(storeId, {
      customerId: selectedCustomer?._id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: [{
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        discount: 0
      }],
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: formData.paymentMethod
    });

    if (result.success) {
      toast.success("Sale created successfully");
      setFormData({ customerId: "walk-in", productId: "", quantity: "1", paymentMethod: "cash" });
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setOpen(false);
      onSaleCreated();
    } else {
      toast.error(result.error || "Failed to create sale");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Quick Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create Quick Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Customer (Optional)</Label>
            <Select value={formData.customerId} onValueChange={handleCustomerChange}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select customer or leave empty" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name} {customer.phone && `(${customer.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Product *</Label>
            <Select value={formData.productId} onValueChange={handleProductChange}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} - GH₵{product.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedProduct && (
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-white font-medium">{selectedProduct.name}</p>
              <p className="text-gray-400 text-sm">Price: GH₵{selectedProduct.price.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Stock: {selectedProduct.stock}</p>
            </div>
          )}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.stock || 999}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
              required
            />
          </div>
          {selectedProduct && (
            <div className="p-3 bg-slate-700 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-white">GH₵{(selectedProduct.price * parseInt(formData.quantity || "1")).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Tax (10%):</span>
                <span className="text-white">GH₵{(selectedProduct.price * parseInt(formData.quantity || "1") * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-slate-600 pt-2 mt-2">
                <span className="text-white">Total:</span>
                <span className="text-white">GH₵{(selectedProduct.price * parseInt(formData.quantity || "1") * 1.1).toFixed(2)}</span>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedProduct}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}