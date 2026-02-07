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
    
    const productsWithIds = products.map(product => ({
      ...product,
      storeId: new mongoose.Types.ObjectId(storeId)
    }));
    
    const result = await Product.insertMany(productsWithIds);
    return { success: true, count: result.length };
  } catch (error) {
    console.error("Error bulk importing products:", error);
    return { success: false, error: "Failed to import products" };
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