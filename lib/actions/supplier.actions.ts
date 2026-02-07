"use server";

import { connectToDB } from "@/lib/mongoose";
import Supplier from "@/lib/models/supplier.models";
import Product from "@/lib/models/product.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

// Get all suppliers
export const getSuppliers = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const suppliers = await Supplier.find({ storeId } as any).lean();
    return JSON.parse(JSON.stringify(suppliers));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
});

// Create supplier
export const createSupplier = withSubscriptionCheckByStoreId(async (storeId: string, supplierData: {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  notes?: string;
}) => {
  try {
    await connectToDB();
    
    const supplier = await Supplier.create({
      ...supplierData,
      storeId: new mongoose.Types.ObjectId(storeId),
    });
    
    return { success: true, supplier: JSON.parse(JSON.stringify(supplier)) };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Failed to create supplier" };
  }
});

// Update supplier
export const updateSupplier = withSubscriptionCheckByStoreId(async (storeId: string, supplierId: string, supplierData: {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}) => {
  try {
    await connectToDB();
    
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return { success: false, error: "Invalid supplier ID" };
    }
    
    const supplier = await Supplier.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(supplierId), storeId: new mongoose.Types.ObjectId(storeId) } as any,
      supplierData,
      { new: true }
    );
    
    return { success: true, supplier: JSON.parse(JSON.stringify(supplier)) };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Failed to update supplier" };
  }
});

// Delete supplier
export const deleteSupplier = withSubscriptionCheckByStoreId(async (storeId: string, supplierId: string) => {
  try {
    await connectToDB();
    
    // Check if supplier has products
    const productsCount = await Product.countDocuments({ 
      storeId: new mongoose.Types.ObjectId(storeId),
      'supplierInfo.name': { $exists: true }
    } as any);
    
    if (productsCount > 0) {
      return { success: false, error: "Cannot delete supplier with associated products" };
    }
    
    await Supplier.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(supplierId), 
      storeId: new mongoose.Types.ObjectId(storeId) 
    } as any);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Failed to delete supplier" };
  }
});

// Get supplier details with products
export const getSupplierDetails = withSubscriptionCheckByStoreId(async (storeId: string, supplierId: string) => {
  try {
    await connectToDB();
    
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return { supplier: null, products: [] };
    }
    
    const supplier = await Supplier.findOne({ 
      _id: new mongoose.Types.ObjectId(supplierId), 
      storeId: new mongoose.Types.ObjectId(storeId) 
    } as any).lean();
    
    const products = await Product.find({ 
      storeId: new mongoose.Types.ObjectId(storeId),
      supplier: supplier?.name
    } as any).lean();
    
    return {
      supplier: JSON.parse(JSON.stringify(supplier)),
      products: JSON.parse(JSON.stringify(products))
    };
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    return { supplier: null, products: [] };
  }
});