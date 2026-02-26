"use server";

import { connectToDB } from "@/lib/mongoose";
import Supplier from "@/lib/models/supplier.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const createSupplier = withSubscriptionCheckByStoreId(async (storeId: string, data: any) => {
  try {
    await connectToDB();
    
    const supplier = await Supplier.create({
      ...data,
      storeId: new mongoose.Types.ObjectId(storeId)
    });
    
    return { success: true, data: JSON.parse(JSON.stringify(supplier)) };
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    return { success: false, error: error.message || "Failed to create supplier" };
  }
});

export const getSuppliers = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const suppliers = await Supplier.find({ storeId } as any).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(suppliers));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
});

export const updateSupplier = withSubscriptionCheckByStoreId(async (storeId: string, supplierId: string, data: any) => {
  try {
    await connectToDB();
    const updated = await Supplier.findOneAndUpdate(
      { _id: supplierId, storeId },
      data,
      { new: true }
    );
    if (!updated) {
      return { success: false, error: "Supplier not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    return { success: false, error: error.message || "Failed to update supplier" };
  }
});

export const deleteSupplier = withSubscriptionCheckByStoreId(async (storeId: string, supplierId: string) => {
  try {
    await connectToDB();
    const result = await Supplier.findOneAndDelete({ _id: supplierId, storeId });
    if (!result) {
      return { success: false, error: "Supplier not found" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: error.message || "Failed to delete supplier" };
  }
});
