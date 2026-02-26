"use server";

import { connectToDB } from "@/lib/mongoose";
import StockTake from "@/lib/models/stock-take.models";
import Product from "@/lib/models/product.models";
import StockMovement from "@/lib/models/stock-movement.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const createStockTake = withSubscriptionCheckByStoreId(async (storeId: string, data: any) => {
  try {
    await connectToDB();
    
    const count = await StockTake.countDocuments({ storeId });
    const stockTakeNumber = `ST-${Date.now()}-${count + 1}`;
    
    const products = await Product.find({ storeId, isAvailable: true }).lean();
    const items = products.map(p => ({
      productId: p._id,
      name: p.name,
      systemStock: p.stock,
      physicalCount: 0,
      variance: 0
    }));
    
    const stockTake = await StockTake.create({
      ...data,
      storeId: new mongoose.Types.ObjectId(storeId),
      stockTakeNumber,
      items
    });
    
    return { success: true, data: JSON.parse(JSON.stringify(stockTake)) };
  } catch (error: any) {
    console.error("Error creating stock take:", error);
    return { success: false, error: error.message || "Failed to create stock take" };
  }
});

export const getStockTakes = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const stockTakes = await StockTake.find({ storeId } as any)
      .populate("createdBy", "fullName")
      .populate("completedBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(stockTakes));
  } catch (error) {
    console.error("Error fetching stock takes:", error);
    return [];
  }
});

export const updateStockTakeCount = withSubscriptionCheckByStoreId(async (storeId: string, stockTakeId: string, productId: string, physicalCount: number) => {
  try {
    await connectToDB();
    
    const stockTake = await StockTake.findOne({ _id: stockTakeId, storeId });
    if (!stockTake) return null;
    
    const itemIndex = stockTake.items.findIndex(i => i.productId.toString() === productId);
    if (itemIndex === -1) return null;
    
    stockTake.items[itemIndex].physicalCount = physicalCount;
    stockTake.items[itemIndex].variance = physicalCount - stockTake.items[itemIndex].systemStock;
    stockTake.totalVariance = stockTake.items.reduce((sum, i) => sum + Math.abs(i.variance), 0);
    
    await stockTake.save();
    return JSON.parse(JSON.stringify(stockTake));
  } catch (error) {
    console.error("Error updating stock take count:", error);
    return null;
  }
});

export const completeStockTake = withSubscriptionCheckByStoreId(async (storeId: string, stockTakeId: string, userId: string, createAdjustment: boolean = true) => {
  try {
    await connectToDB();
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const stockTake = await StockTake.findOne({ _id: stockTakeId, storeId });
      if (!stockTake) throw new Error("Stock take not found");
      
      if (createAdjustment) {
        for (const item of stockTake.items) {
          if (item.variance !== 0) {
            const product = await Product.findById(item.productId);
            if (product) {
              const previousStock = product.stock;
              const newStock = item.physicalCount;
              
              await Product.findByIdAndUpdate(item.productId, { stock: newStock });
              
              await StockMovement.create({
                storeId: new mongoose.Types.ObjectId(storeId),
                productId: item.productId,
                type: "adjustment",
                quantity: item.variance,
                previousStock,
                newStock,
                userId: new mongoose.Types.ObjectId(userId),
                reference: stockTake.stockTakeNumber,
                reason: `Stock take adjustment - ${stockTake.stockTakeNumber}`
              });
            }
          }
        }
      }
      
      await StockTake.findByIdAndUpdate(stockTakeId, {
        status: "completed",
        completedDate: new Date(),
        completedBy: new mongoose.Types.ObjectId(userId),
        adjustmentCreated: createAdjustment
      });
      
      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error("Error completing stock take:", error);
    return { success: false, error: error.message || "Failed to complete stock take" };
  }
});

export const deleteStockTake = withSubscriptionCheckByStoreId(async (storeId: string, stockTakeId: string) => {
  try {
    await connectToDB();
    await StockTake.findOneAndDelete({ _id: stockTakeId, storeId });
    return true;
  } catch (error) {
    console.error("Error deleting stock take:", error);
    return false;
  }
});
