"use server";

import { connectToDB } from "@/lib/mongoose";
import Sale from "@/lib/models/sale.models";
import Customer from "@/lib/models/customer.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const getSales = withSubscriptionCheckByStoreId(async (
  storeId: string, 
  limit?: number,
  startDate?: string,
  endDate?: string
) => {
  try {
    await connectToDB();
    const filter: any = { 
      storeId: new mongoose.Types.ObjectId(storeId)
    };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
    const query = Sale.find(filter as any)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });
    
    if (limit) {
      query.limit(limit);
    }
    
    const sales = await query.lean();
    return JSON.parse(JSON.stringify(sales));
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
});

export const getSaleStats = withSubscriptionCheckByStoreId(async (
  storeId: string,
  startDate?: string,
  endDate?: string
) => {
  try {
    await connectToDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    // If date range provided, use it for main stats
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const rangeSales = await Sale.find({
        storeId: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: start, $lte: end }
      } as any).lean();
      
      const rangeRevenue = rangeSales.reduce((sum, sale) => sum + sale.total, 0);
      const rangeTransactions = rangeSales.length;
      const avgSale = rangeTransactions > 0 ? rangeRevenue / rangeTransactions : 0;
      
      // This month's sales for comparison
      const thisMonthSales = await Sale.find({
        storeId: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: thisMonth }
      } as any).lean();
      const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.total, 0);
      
      return {
        todayRevenue: rangeRevenue,
        todayTransactions: rangeTransactions,
        avgSale,
        thisMonthRevenue,
        revenueGrowth: 0,
        transactionGrowth: 0
      };
    }
    
    // Default: Today's sales
    const todaySales = await Sale.find({
      storeId: new mongoose.Types.ObjectId(storeId),
      createdAt: { $gte: today }
    } as any).lean();
    
    // Yesterday's sales
    const yesterdaySales = await Sale.find({
      storeId: new mongoose.Types.ObjectId(storeId),
      createdAt: { $gte: yesterday, $lt: today }
    } as any).lean();
    
    // This month's sales
    const thisMonthSales = await Sale.find({
      storeId: new mongoose.Types.ObjectId(storeId),
      createdAt: { $gte: thisMonth }
    } as any).lean();
    
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
    const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.total, 0);
    
    const todayTransactions = todaySales.length;
    const yesterdayTransactions = yesterdaySales.length;
    
    const avgSale = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;
    
    return {
      todayRevenue,
      todayTransactions,
      avgSale,
      thisMonthRevenue,
      revenueGrowth: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0,
      transactionGrowth: yesterdayTransactions > 0 ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions * 100) : 0
    };
  } catch (error) {
    console.error("Error fetching sale stats:", error);
    return {
      todayRevenue: 0,
      todayTransactions: 0,
      avgSale: 0,
      thisMonthRevenue: 0,
      revenueGrowth: 0,
      transactionGrowth: 0
    };
  }
});

export const createSale = withSubscriptionCheckByStoreId(async (storeId: string, saleData: {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variations?: string[];
    discount?: number;
  }[];
  subtotal: number;
  tax: number;
  taxType?: 'percentage' | 'fixed';
  discount: number;
  discountType?: 'percentage' | 'fixed';
  total: number;
  paymentMethod?: string;
  notes?: string;
  cashierId?: string;
}) => {
  try {
    console.log('Sale creation initiated');
    await connectToDB();
    
    // Convert items productId to ObjectId
    const itemsWithObjectId = saleData.items.map(item => ({
      ...item,
      productId: new mongoose.Types.ObjectId(item.productId)
    }));
    
    // Generate sale number
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const saleCount = await Sale.countDocuments({ 
      storeId: new mongoose.Types.ObjectId(storeId)
    } as any);
    const saleNumber = `S${datePrefix}-${String(saleCount + 1).padStart(4, '0')}`;
    
    console.log('Creating sale with number:', saleNumber);
    const sale = await Sale.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      saleNumber,
      customerId: saleData.customerId ? new mongoose.Types.ObjectId(saleData.customerId) : undefined,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      items: itemsWithObjectId,
      subtotal: saleData.subtotal,
      tax: saleData.tax,
      taxType: saleData.taxType,
      discount: saleData.discount,
      discountType: saleData.discountType,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      notes: saleData.notes,
      cashierId: saleData.cashierId ? new mongoose.Types.ObjectId(saleData.cashierId) : undefined,
      status: 'completed',
      paymentStatus: 'paid'
    } as any);
    
    console.log('Sale created successfully');
    
    // Update customer total purchases and loyalty points if customer exists
    if (saleData.customerId) {
      if (!mongoose.Types.ObjectId.isValid(saleData.customerId)) {
        console.error("Invalid customer ID format");
        return { success: false, error: "Invalid customer ID" };
      }
      
      try {
        await Customer.updateOne(
          { _id: new mongoose.Types.ObjectId(saleData.customerId) } as any,
          {
            $inc: {
              totalPurchases: saleData.total,
              loyaltyPoints: Math.floor(saleData.total / 10)
            },
            lastVisit: new Date()
          }
        );
      } catch (customerError) {
        console.error("Error updating customer loyalty points");
        return { success: false, error: "Failed to update customer data" };
      }
    }
    
    return { success: true, sale: JSON.parse(JSON.stringify(sale)) };
  } catch (error: any) {
    console.error("Error creating sale:", error);
    console.error("Error details:", error.message);
    console.error("Sale data:", JSON.stringify(saleData, null, 2));
    return { success: false, error: error.message || "Failed to create sale" };
  }
});

export async function updateSaleStatus(saleId: string, status: 'pending' | 'completed' | 'cancelled' | 'refunded') {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return { success: false, error: "Invalid sale ID format" };
    }
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }
    
    const sale = await Sale.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(saleId) } as any,
      { status },
      { new: true }
    );
    
    if (!sale) {
      return { success: false, error: "Sale not found" };
    }
    
    return { success: true, sale: JSON.parse(JSON.stringify(sale)) };
  } catch (error) {
    console.error("Error updating sale status:", error);
    return { success: false, error: "Failed to update sale status" };
  }
}

export async function getSaleDetails(saleId: string) {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return null;
    }
    
    const sale = await Sale.findOne({ 
      _id: new mongoose.Types.ObjectId(saleId)
    } as any)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name image')
      .lean();
    
    return sale ? JSON.parse(JSON.stringify(sale)) : null;
  } catch (error) {
    console.error("Error fetching sale details:", error);
    return null;
  }
}

export async function refundSale(saleId: string, refundAmount?: number) {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return { success: false, error: "Invalid sale ID format" };
    }
    
    const sale = await Sale.findOne({ _id: new mongoose.Types.ObjectId(saleId) } as any);
    if (!sale) {
      return { success: false, error: "Sale not found" };
    }
    
    // Validate refund eligibility
    if (sale.status === 'refunded') {
      return { success: false, error: "Sale already refunded" };
    }
    
    if (sale.status === 'cancelled') {
      return { success: false, error: "Cannot refund cancelled sale" };
    }
    
    const actualRefundAmount = refundAmount || sale.total;
    
    // Validate refund amount
    if (actualRefundAmount <= 0 || actualRefundAmount > sale.total) {
      return { success: false, error: "Invalid refund amount" };
    }
    
    await Sale.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(saleId) } as any,
      {
        status: 'refunded',
        paymentStatus: 'refunded'
      }
    );
    
    // Deduct from customer total purchases and loyalty points if customer exists
    if (sale.customerId) {
      if (!mongoose.Types.ObjectId.isValid(sale.customerId.toString())) {
        console.error("Invalid customer ID in sale record");
        return { success: false, error: "Invalid customer data" };
      }
      
      try {
        await Customer.updateOne(
          { _id: sale.customerId } as any,
          {
            $inc: {
              totalPurchases: -actualRefundAmount,
              loyaltyPoints: -Math.floor(actualRefundAmount / 10)
            }
          }
        );
      } catch (customerError) {
        console.error("Error updating customer loyalty points");
        return { success: false, error: "Failed to update customer data" };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error refunding sale:", error);
    return { success: false, error: "Failed to refund sale" };
  }
}

export async function getTodaysSales(storeId: string) {
  return withSubscriptionCheckByStoreId(async (storeId: string) => {
    try {
      await connectToDB();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sales = await Sale.find({
        storeId: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: today }
      } as any).lean();
      
      const todaySales = sales.length;
      const todayRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      
      return { todaySales, todayRevenue };
    } catch (error) {
      console.error("Error fetching today's sales:", error);
      return { todaySales: 0, todayRevenue: 0 };
    }
  })(storeId);
}