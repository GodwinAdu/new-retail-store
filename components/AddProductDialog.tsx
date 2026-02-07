"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { getCategories, createCategory } from "@/lib/actions/category.actions";
import { createProduct } from "@/lib/actions/product.actions";
import { getSuppliers } from "@/lib/actions/supplier.actions";
import CreateCategoryDialog from "@/components/CreateCategoryDialog";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { useSubscriptionHandler } from "@/hooks/use-subscription-handler";

interface AddProductDialogProps {
  storeId: string;
  onProductAdded?: () => void;
}

export default function AddProductDialog({ storeId, onProductAdded }: AddProductDialogProps) {
  const { inventorySettings } = useSettings();
  const { executeWithSubscriptionCheck } = useSubscriptionHandler();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    const loadData = async () => {
      const [categoriesData, suppliersData] = await Promise.all([
        getCategories(storeId),
        getSuppliers(storeId)
      ]);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    };
    if (open) {
      loadData();
    }
  }, [open, storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.stock) {
      toast.error("Name, SKU, category, price, and stock are required");
      return;
    }

    setLoading(true);
    
    const result = await executeWithSubscriptionCheck(async () => {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: formData.minStock ? parseInt(formData.minStock) : inventorySettings.lowStockThreshold,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : 100,
        reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : 10,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        expiryDate: formData.expiryDate || null,
        variations: formData.variations.map(v => ({
          name: v.name,
          price: parseFloat(v.price),
          isAvailable: v.isAvailable
        })),
        categoryId: formData.category
      };
      
      return await createProduct(storeId, productData);
    }, "Failed to add product");
    
    if (result) {
      toast.success("Product added successfully");
      setOpen(false);
      setFormData({
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
        variations: []
      });
      onProductAdded?.();
    }
    
    setLoading(false);
  };

  const handleCategoryCreated = async () => {
    const categoriesData = await getCategories(storeId);
    setCategories(categoriesData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="iPhone 15 Pro"
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="IPH15P"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="category">Category *</Label>
              <CreateCategoryDialog storeId={storeId} onCategoryCreated={handleCategoryCreated} />
            </div>
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
                placeholder="500.00"
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
                placeholder="999.99"
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
                placeholder="25"
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
                placeholder={inventorySettings.lowStockThreshold.toString()}
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
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                placeholder="123456789012"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Advanced Options */}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}