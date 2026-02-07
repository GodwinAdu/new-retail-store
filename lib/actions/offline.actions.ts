"use server";

import { connectToDB } from "@/lib/mongoose";
import OfflineSale from "@/lib/models/offline-sale.models";
import Sale from "@/lib/models/sale.models";
import Product from "@/lib/models/product.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

// Store offline sale
export const storeOfflineSale = withSubscriptionCheckByStoreId(async (storeId: string, branchId: string, saleData: any, localId: string, deviceId?: string) => {
  try {
    await connectToDB();
    
    const offlineSale = await OfflineSale.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: new mongoose.Types.ObjectId(branchId),
      localId,
      saleData,
      deviceId
    });
    
    return { success: true, offlineSaleId: offlineSale._id };
  } catch (error) {
    console.error("Error storing offline sale:", error);
    return { success: false, error: "Failed to store offline sale" };
  }
});

// Sync offline sales
export const syncOfflineSales = withSubscriptionCheckByStoreId(async (storeId: string, branchId?: string) => {
  try {
    await connectToDB();
    const query = branchId ? { storeId, branchId, status: 'pending' } : { storeId, status: 'pending' };
    
    const offlineSales = await OfflineSale.find(query as any).lean();
    const results = [];
    
    for (const offlineSale of offlineSales) {
      try {
        // Create the actual sale
        const sale = await Sale.create({
          ...offlineSale.saleData,
          storeId: offlineSale.storeId,
          branchId: offlineSale.branchId,
        });
        
        // Update inventory
        for (const item of offlineSale.saleData.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } }
          );
        }
        
        // Mark as synced
        await OfflineSale.findByIdAndUpdate(offlineSale._id, {
          status: 'synced',
          syncedSaleId: sale._id,
          lastSyncAttempt: new Date()
        });
        
        results.push({ localId: offlineSale.localId, success: true, saleId: sale._id });
      } catch (error) {
        // Mark sync attempt
        await OfflineSale.findByIdAndUpdate(offlineSale._id, {
          $inc: { syncAttempts: 1 },
          lastSyncAttempt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        
        results.push({ localId: offlineSale.localId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("Error syncing offline sales:", error);
    return { success: false, error: "Failed to sync offline sales" };
  }
});

// Get offline sales status
export const getOfflineSalesStatus = withSubscriptionCheckByStoreId(async (storeId: string, branchId?: string) => {
  try {
    await connectToDB();
    const query = branchId ? { storeId, branchId } : { storeId };
    
    const pending = await OfflineSale.countDocuments({ ...query, status: 'pending' } as any);
    const synced = await OfflineSale.countDocuments({ ...query, status: 'synced' } as any);
    const failed = await OfflineSale.countDocuments({ ...query, status: 'failed' } as any);
    
    return { pending, synced, failed };
  } catch (error) {
    console.error("Error getting offline sales status:", error);
    return { pending: 0, synced: 0, failed: 0 };
  }
});

// Get offline data for client
export const getOfflineData = withSubscriptionCheckByStoreId(async (storeId: string, branchId: string) => {
  try {
    await connectToDB();
    
    const products = await Product.find({ 
      storeId: new mongoose.Types.ObjectId(storeId), 
      branchId: new mongoose.Types.ObjectId(branchId),
      isAvailable: true 
    } as any).lean();
    
    return {
      products: JSON.parse(JSON.stringify(products)),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting offline data:", error);
    return { products: [], timestamp: new Date().toISOString() };
  }
});