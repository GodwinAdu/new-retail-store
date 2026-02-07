"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateProduct } from "@/lib/actions/product.actions";
import { getSuppliers } from "@/lib/actions/supplier.actions";

interface EditProductDialogProps {
  product: any;
  storeId: string;
  categories: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

export default function EditProductDialog({ product, storeId, categories, open, onOpenChange, onProductUpdated }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    barcode: "",
    minStock: "",
    maxStock: "",
    costPrice: "",
    reorderPoint: "",
    supplier: "",
    expiryDate: "",
    batchNumber: "",
    isPerishable: false,
    variations: [] as Array<{name: string; price: string; isAvailable: boolean}>
  });

  useEffect(() => {
    const loadSuppliers = async () => {
      const suppliersData = await getSuppliers(storeId);
      setSuppliers(suppliersData);
    };
    if (open) {
      loadSuppliers();
    }
  }, [open, storeId]);

  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.categoryId || product.category?._id || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
        barcode: product.barcode || "",
        minStock: product.minStock?.toString() || "",
        maxStock: product.maxStock?.toString() || "",
        costPrice: product.costPrice?.toString() || "",
        reorderPoint: product.reorderPoint?.toString() || "",
        supplier: product.supplier || "",
        expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
        batchNumber: product.batchNumber || "",
        isPerishable: product.isPerishable || false,
        variations: product.variations?.map((v: any) => ({
          name: v.name,
          price: v.price?.toString() || "",
          isAvailable: v.isAvailable ?? true
        })) || []
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        barcode: formData.barcode,
        minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : undefined,
        supplier: formData.supplier || null,
        expiryDate: formData.expiryDate || null,
        batchNumber: formData.batchNumber || null,
        isPerishable: formData.isPerishable,
        variations: formData.variations.map(v => ({
          name: v.name,
          price: parseFloat(v.price),
          isAvailable: v.isAvailable
        }))
      };
      
      const result = await updateProduct(storeId, product._id, productData);
      
      if (result) {
        toast.success("Product updated successfully");
        onOpenChange(false);
        onProductUpdated();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="price">Selling Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxStock">Maximum Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between"
            >
              <span>Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {showAdvanced && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reorderPoint">Reorder Point</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      value={formData.reorderPoint}
                      onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                      placeholder="BATCH001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPerishable"
                    checked={formData.isPerishable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPerishable: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPerishable" className="cursor-pointer">Perishable Product</Label>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Product Variations</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        variations: [...prev.variations, { name: "", price: "", isAvailable: true }]
                      }))}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Variation
                    </Button>
                  </div>
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Size/Color"
                        value={variation.name}
                        onChange={(e) => {
                          const newVariations = [...formData.variations];
                          newVariations[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, variations: newVariations }));
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={variation.price}
                        onChange={(e) => {
                          const newVariations = [...formData.variations];
                          newVariations[index].price = e.target.value;
                          setFormData(prev => ({ ...prev, variations: newVariations }));
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          variations: prev.variations.filter((_, i) => i !== index)
                        }))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
