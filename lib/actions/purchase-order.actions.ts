"use server";

import { connectToDB } from "@/lib/mongoose";
import PurchaseOrder from "@/lib/models/purchase-order.models";
import Product from "@/lib/models/product.models";
import StockMovement from "@/lib/models/stock-movement.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

export const createPurchaseOrder = withSubscriptionCheckByStoreId(async (storeId: string, data: any) => {
  try {
    await connectToDB();
    
    const poCount = await PurchaseOrder.countDocuments({ storeId });
    const poNumber = `PO-${Date.now()}-${poCount + 1}`;
    
    const purchaseOrder = await PurchaseOrder.create({
      ...data,
      storeId: new mongoose.Types.ObjectId(storeId),
      poNumber
    });
    
    return { success: true, data: JSON.parse(JSON.stringify(purchaseOrder)) };
  } catch (error: any) {
    console.error("Error creating purchase order:", error);
    return { success: false, error: error.message || "Failed to create purchase order" };
  }
});

export const getPurchaseOrders = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const orders = await PurchaseOrder.find({ storeId } as any)
      .populate("supplierId", "name contact")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return [];
  }
});

export const updatePurchaseOrder = withSubscriptionCheckByStoreId(async (storeId: string, poId: string, data: any) => {
  try {
    await connectToDB();
    const updated = await PurchaseOrder.findOneAndUpdate(
      { _id: poId, storeId },
      data,
      { new: true }
    );
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return null;
  }
});

export const receivePurchaseOrder = withSubscriptionCheckByStoreId(async (storeId: string, poId: string, userId: string) => {
  try {
    await connectToDB();
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const po = await PurchaseOrder.findOne({ _id: poId, storeId });
      if (!po) throw new Error("Purchase order not found");
      
      for (const item of po.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;
          
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
            costPrice: item.costPrice
          });
          
          await StockMovement.create({
            storeId: new mongoose.Types.ObjectId(storeId),
            productId: item.productId,
            type: "purchase",
            quantity: item.quantity,
            previousStock,
            newStock,
            userId: new mongoose.Types.ObjectId(userId),
            reference: po.poNumber,
            reason: `Received from PO ${po.poNumber}`
          });
        }
      }
      
      await PurchaseOrder.findByIdAndUpdate(poId, {
        status: "received",
        receivedDate: new Date(),
        "items.$[].receivedQuantity": po.items.map(i => i.quantity)
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
    console.error("Error receiving purchase order:", error);
    return { success: false, error: error.message || "Failed to receive purchase order" };
  }
});

export const deletePurchaseOrder = withSubscriptionCheckByStoreId(async (storeId: string, poId: string) => {
  try {
    await connectToDB();
    await PurchaseOrder.findOneAndDelete({ _id: poId, storeId });
    return true;
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return false;
  }
});
