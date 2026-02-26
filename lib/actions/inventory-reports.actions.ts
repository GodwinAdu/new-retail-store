"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import Sale from "@/lib/models/sale.models";
import StockMovement from "@/lib/models/stock-movement.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const getStockMovementReport = withSubscriptionCheckByStoreId(async (storeId: string, startDate?: Date, endDate?: Date) => {
  try {
    await connectToDB();
    
    const query: any = { storeId: new mongoose.Types.ObjectId(storeId) };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const movements = await StockMovement.find(query)
      .populate("productId", "name sku")
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(movements));
  } catch (error) {
    console.error("Error fetching stock movement report:", error);
    return [];
  }
});

export const getABCAnalysis = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    
    const salesData = await Sale.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId), status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);
    
    const totalRevenue = salesData.reduce((sum, item) => sum + item.totalRevenue, 0);
    let cumulativeRevenue = 0;
    
    const analysis = salesData.map(item => {
      cumulativeRevenue += item.totalRevenue;
      const revenuePercent = (item.totalRevenue / totalRevenue) * 100;
      const cumulativePercent = (cumulativeRevenue / totalRevenue) * 100;
      
      let category = "C";
      if (cumulativePercent <= 80) category = "A";
      else if (cumulativePercent <= 95) category = "B";
      
      return {
        productId: item._id,
        productName: item.product.name,
        sku: item.product.sku,
        totalRevenue: item.totalRevenue,
        totalQuantity: item.totalQuantity,
        revenuePercent,
        cumulativePercent,
        category
      };
    });
    
    return JSON.parse(JSON.stringify(analysis));
  } catch (error) {
    console.error("Error generating ABC analysis:", error);
    return [];
  }
});

export const getInventoryTurnover = withSubscriptionCheckByStoreId(async (storeId: string, days: number = 30) => {
  try {
    await connectToDB();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const products = await Product.find({ storeId } as any).lean();
    const salesData = await Sale.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
          status: "completed",
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalCost: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      }
    ]);
    
    const turnoverData = products.map(product => {
      const sales = salesData.find(s => s._id.toString() === product._id.toString());
      const soldQty = sales?.totalSold || 0;
      const avgStock = (product.stock + soldQty) / 2;
      const turnoverRate = avgStock > 0 ? soldQty / avgStock : 0;
      const daysToSell = turnoverRate > 0 ? days / turnoverRate : 0;
      
      return {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.stock,
        soldQuantity: soldQty,
        turnoverRate: turnoverRate.toFixed(2),
        daysToSell: Math.round(daysToSell),
        status: daysToSell > 90 ? "slow" : daysToSell > 30 ? "medium" : "fast"
      };
    });
    
    return JSON.parse(JSON.stringify(turnoverData));
  } catch (error) {
    console.error("Error calculating inventory turnover:", error);
    return [];
  }
});

export const getStockAgingReport = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    
    const products = await Product.find({ storeId, stock: { $gt: 0 } } as any)
      .populate("categoryId", "name")
      .lean();
    
    const agingData = products.map(product => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const stockValue = product.stock * (product.costPrice || product.price);
      
      let ageCategory = "0-30 days";
      if (daysSinceCreated > 180) ageCategory = "180+ days";
      else if (daysSinceCreated > 90) ageCategory = "90-180 days";
      else if (daysSinceCreated > 60) ageCategory = "60-90 days";
      else if (daysSinceCreated > 30) ageCategory = "30-60 days";
      
      return {
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        category: product.categoryId?.name || "Uncategorized",
        stock: product.stock,
        stockValue,
        daysSinceCreated,
        ageCategory
      };
    });
    
    return JSON.parse(JSON.stringify(agingData));
  } catch (error) {
    console.error("Error generating stock aging report:", error);
    return [];
  }
});

export const getDeadStockAnalysis = withSubscriptionCheckByStoreId(async (storeId: string, days: number = 90) => {
  try {
    await connectToDB();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const products = await Product.find({ storeId, stock: { $gt: 0 } } as any).lean();
    const recentSales = await Sale.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
          status: "completed",
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId" } }
    ]);
    
    const soldProductIds = new Set(recentSales.map(s => s._id.toString()));
    
    const deadStock = products
      .filter(p => !soldProductIds.has(p._id.toString()))
      .map(p => ({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        stock: p.stock,
        stockValue: p.stock * (p.costPrice || p.price),
        daysSinceLastSale: days
      }));
    
    return JSON.parse(JSON.stringify(deadStock));
  } catch (error) {
    console.error("Error analyzing dead stock:", error);
    return [];
  }
});
