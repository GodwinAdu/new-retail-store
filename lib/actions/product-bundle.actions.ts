"use server";

import { connectToDB } from "@/lib/mongoose";
import ProductBundle from "@/lib/models/product-bundle.models";
import Product from "@/lib/models/product.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const createProductBundle = withSubscriptionCheckByStoreId(async (storeId: string, data: any) => {
  try {
    await connectToDB();
    
    const bundle = await ProductBundle.create({
      ...data,
      storeId: new mongoose.Types.ObjectId(storeId)
    });
    
    return JSON.parse(JSON.stringify(bundle));
  } catch (error) {
    console.error("Error creating product bundle:", error);
    return null;
  }
});

export const getProductBundles = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const bundles = await ProductBundle.find({ storeId } as any)
      .populate("components.productId", "name stock")
      .lean();
    return JSON.parse(JSON.stringify(bundles));
  } catch (error) {
    console.error("Error fetching product bundles:", error);
    return [];
  }
});

export const updateProductBundle = withSubscriptionCheckByStoreId(async (storeId: string, bundleId: string, data: any) => {
  try {
    await connectToDB();
    const updated = await ProductBundle.findOneAndUpdate(
      { _id: bundleId, storeId },
      data,
      { new: true }
    );
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating product bundle:", error);
    return null;
  }
});

export const deleteProductBundle = withSubscriptionCheckByStoreId(async (storeId: string, bundleId: string) => {
  try {
    await connectToDB();
    await ProductBundle.findOneAndDelete({ _id: bundleId, storeId });
    return true;
  } catch (error) {
    console.error("Error deleting product bundle:", error);
    return false;
  }
});

export const checkBundleAvailability = withSubscriptionCheckByStoreId(async (storeId: string, bundleId: string, quantity: number = 1) => {
  try {
    await connectToDB();
    
    const bundle = await ProductBundle.findOne({ _id: bundleId, storeId }).populate("components.productId");
    if (!bundle) return { available: false, reason: "Bundle not found" };
    
    for (const component of bundle.components) {
      const product = component.productId as any;
      const requiredQty = component.quantity * quantity;
      
      if (product.stock < requiredQty) {
        return {
          available: false,
          reason: `Insufficient stock for ${product.name}. Required: ${requiredQty}, Available: ${product.stock}`
        };
      }
    }
    
    return { available: true };
  } catch (error) {
    console.error("Error checking bundle availability:", error);
    return { available: false, reason: "Error checking availability" };
  }
});
