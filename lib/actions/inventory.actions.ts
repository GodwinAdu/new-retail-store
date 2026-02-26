"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import Sale from "@/lib/models/sale.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const getLowStockAlerts = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    
    const lowStockProducts = await Product.find({
      storeId,
      $expr: { $lte: ["$stock", "$minStock"] },
      isAvailable: true
    } as any).lean();
    
    return JSON.parse(JSON.stringify(lowStockProducts));
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    return [];
  }
});

export const getReorderAlerts = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    
    const reorderProducts = await Product.find({
      storeId,
      $expr: { $lte: ["$stock", "$reorderPoint"] },
      autoReorder: true,
      isAvailable: true
    } as any).lean();
    
    return JSON.parse(JSON.stringify(reorderProducts));
  } catch (error) {
    console.error("Error fetching reorder alerts:", error);
    return [];
  }
});

export const getExpiringProducts = withSubscriptionCheckByStoreId(async (storeId: string, days: number = 7) => {
  try {
    await connectToDB();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    const expiringProducts = await Product.find({
      storeId,
      isPerishable: true,
      expiryDate: { $lte: expiryDate, $ne: null },
      isAvailable: true
    } as any).lean();
    
    return JSON.parse(JSON.stringify(expiringProducts));
  } catch (error) {
    console.error("Error fetching expiring products:", error);
    return [];
  }
});

export const getTopSellingProducts = withSubscriptionCheckByStoreId(async (storeId: string, limit: number = 10) => {
  try {
    await connectToDB();
    const matchQuery = { storeId: new mongoose.Types.ObjectId(storeId) };
    
    const topProducts = await Sale.aggregate([
      { $match: { ...matchQuery, status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          productName: { $first: "$items.name" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      }
    ]);
    
    return JSON.parse(JSON.stringify(topProducts));
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
});

export const getRevenueSummary = withSubscriptionCheckByStoreId(async (storeId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  try {
    await connectToDB();
    const matchQuery = { storeId: new mongoose.Types.ObjectId(storeId) };
    
    let groupBy;
    switch (period) {
      case 'weekly':
        groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }
    
    const revenueSummary = await Sale.aggregate([
      { $match: { ...matchQuery, status: "completed" } },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$total" },
          totalSales: { $sum: 1 },
          averageOrderValue: { $avg: "$total" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    return JSON.parse(JSON.stringify(revenueSummary));
  } catch (error) {
    console.error("Error fetching revenue summary:", error);
    return [];
  }
});

export const bulkImportProducts = withSubscriptionCheckByStoreId(async (storeId: string, products: any[]) => {
  try {
    await connectToDB();
    
    const errors: string[] = [];
    const validProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.name || !product.price) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }
      
      if (product.sku) {
        const existing = await Product.findOne({ storeId, sku: product.sku });
        if (existing) {
          errors.push(`Row ${i + 1}: SKU ${product.sku} already exists`);
          continue;
        }
      }
      
      validProducts.push({
        ...product,
        storeId: new mongoose.Types.ObjectId(storeId)
      });
    }
    
    if (validProducts.length > 0) {
      await Product.insertMany(validProducts);
    }
    
    return { 
      success: true, 
      count: validProducts.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error("Error bulk importing products:", error);
    return { success: false, error: "Failed to import products" };
  }
});

export const bulkUpdatePrices = withSubscriptionCheckByStoreId(async (storeId: string, updates: { productId: string; price?: number; costPrice?: number }[]) => {
  try {
    await connectToDB();
    
    for (const update of updates) {
      const updateData: any = {};
      if (update.price !== undefined) updateData.price = update.price;
      if (update.costPrice !== undefined) updateData.costPrice = update.costPrice;
      
      await Product.findOneAndUpdate(
        { _id: update.productId, storeId },
        updateData
      );
    }
    
    return { success: true, count: updates.length };
  } catch (error) {
    console.error("Error bulk updating prices:", error);
    return { success: false, error: "Failed to update prices" };
  }
});

export const bulkUpdateCategory = withSubscriptionCheckByStoreId(async (storeId: string, productIds: string[], categoryId: string) => {
  try {
    await connectToDB();
    
    await Product.updateMany(
      { _id: { $in: productIds }, storeId },
      { categoryId: new mongoose.Types.ObjectId(categoryId) }
    );
    
    return { success: true, count: productIds.length };
  } catch (error) {
    console.error("Error bulk updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
});

export const bulkDeleteProducts = withSubscriptionCheckByStoreId(async (storeId: string, productIds: string[]) => {
  try {
    await connectToDB();
    
    await Product.deleteMany({ _id: { $in: productIds }, storeId });
    
    return { success: true, count: productIds.length };
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return { success: false, error: "Failed to delete products" };
  }
});

export const adjustStock = withSubscriptionCheckByStoreId(async (storeId: string, productId: string, adjustment: number, userId: string, reason: string) => {
  try {
    await connectToDB();
    
    const product = await Product.findOne({ _id: productId, storeId });
    if (!product) return { success: false, error: "Product not found" };
    
    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + adjustment);
    
    await Product.findByIdAndUpdate(productId, { stock: newStock });
    
    const StockMovement = (await import("@/lib/models/stock-movement.models")).default;
    await StockMovement.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      productId: new mongoose.Types.ObjectId(productId),
      type: "adjustment",
      quantity: adjustment,
      previousStock,
      newStock,
      userId: new mongoose.Types.ObjectId(userId),
      reason
    });
    
    return { success: true, newStock };
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: "Failed to adjust stock" };
  }
});

export const searchByBarcode = withSubscriptionCheckByStoreId(async (storeId: string, barcode: string) => {
  try {
    await connectToDB();
    
    const product = await Product.findOne({ storeId, barcode } as any)
      .populate("categoryId", "name color")
      .lean();
    
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Error searching by barcode:", error);
    return null;
  }
});

export const exportProducts = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    
    const products = await Product.find({ storeId } as any)
      .populate('categoryId', 'name')
      .lean();
    
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error exporting products:", error);
    return [];
  }
});