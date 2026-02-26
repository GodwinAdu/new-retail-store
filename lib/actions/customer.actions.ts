"use server";

import { connectToDB } from "@/lib/mongoose";
import Customer from "@/lib/models/customer.models";
import Sale from "@/lib/models/sale.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const getCustomers = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const customers = await Customer.find({ storeId } as any).lean();
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
});

export async function getCustomerStats(storeId: string) {
  try {
    await connectToDB();
    const query = { storeId: new mongoose.Types.ObjectId(storeId) };
    const totalCustomers = await Customer.countDocuments(query as any);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = await Customer.countDocuments({ 
      ...query,
      createdAt: { $gte: thisMonth } 
    } as any);
    const vipCustomers = await Customer.countDocuments({ 
      ...query,
      totalPurchases: { $gte: 1000 } 
    } as any);
    const avgSpend = await Customer.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: "$totalPurchases" } } }
    ]);
    
    return {
      totalCustomers,
      newThisMonth,
      vipCustomers,
      avgSpend: avgSpend[0]?.avg || 0
    };
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return { totalCustomers: 0, newThisMonth: 0, vipCustomers: 0, avgSpend: 0 };
  }
}

export const createCustomer = withSubscriptionCheckByStoreId(async (storeId: string, customerData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    await connectToDB();
    
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return { success: false, error: "Invalid store ID" };
    }
    
    const customer = await Customer.create({
      ...customerData,
      storeId: new mongoose.Types.ObjectId(storeId),
      loyaltyPoints: 0,
      totalPurchases: 0
    } as any);
    return { success: true, data: JSON.parse(JSON.stringify(customer)) };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message || "Failed to create customer" };
  }
});

export const updateCustomer = withSubscriptionCheckByStoreId(async (storeId: string, customerId: string, customerData: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return { success: false, error: "Invalid customer ID format" };
    }
    
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return { success: false, error: "Invalid store ID format" };
    }
    
    const customer = await Customer.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(customerId), 
        storeId: new mongoose.Types.ObjectId(storeId) 
      } as any,
      customerData,
      { new: true }
    );
    return { success: true, customer: JSON.parse(JSON.stringify(customer)) };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
});

export const deleteCustomer = withSubscriptionCheckByStoreId(async (storeId: string, customerId: string) => {
  try {
    await connectToDB();
    await Customer.findOneAndDelete({ _id: customerId, storeId } as any);
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: "Failed to delete customer" };
  }
});

export async function getCustomerDetails(customerId: string) {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return { customer: null, sales: [] };
    }
    
    const customer = await Customer.findById(new mongoose.Types.ObjectId(customerId)).lean();
    const sales = await Sale.find({ 
      customerId: new mongoose.Types.ObjectId(customerId) 
    } as any).sort({ createdAt: -1 }).limit(10).lean();
    return {
      customer: JSON.parse(JSON.stringify(customer)),
      sales: JSON.parse(JSON.stringify(sales))
    };
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return { customer: null, sales: [] };
  }
}

export async function updateCustomerLoyaltyPoints(customerId: string, points: number) {
  try {
    await connectToDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return false;
    }
    
    await Customer.findByIdAndUpdate(
      new mongoose.Types.ObjectId(customerId), 
      { $inc: { loyaltyPoints: points } }
    );
    return true;
  } catch (error) {
    console.error("Error updating loyalty points:", error);
    return false;
  }
}