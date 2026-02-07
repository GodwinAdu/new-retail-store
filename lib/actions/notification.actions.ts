"use server";

import { connectToDB } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.models";
import Sale from "@/lib/models/sale.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

// Send receipt via SMS
export const sendSMSReceipt = withSubscriptionCheckByStoreId(async (storeId: string, saleId: string, phoneNumber: string) => {
  try {
    await connectToDB();
    
    const sale = await Sale.findOne({ 
      _id: new mongoose.Types.ObjectId(saleId), 
      storeId: new mongoose.Types.ObjectId(storeId) 
    } as any).lean();
    
    if (!sale) {
      return { success: false, error: "Sale not found" };
    }
    
    const message = `Receipt #${sale.saleNumber}\\nTotal: $${sale.total.toFixed(2)}\\nThank you for your purchase!`;
    
    const notification = await Notification.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: sale.branchId,
      type: 'sms',
      recipient: phoneNumber,
      message,
      relatedSaleId: sale._id,
      metadata: { saleNumber: sale.saleNumber, total: sale.total }
    });
    
    // Here you would integrate with SMS service (Twilio, etc.)
    // For now, we'll mark as sent
    await Notification.findByIdAndUpdate(notification._id, {
      status: 'sent',
      sentAt: new Date()
    });
    
    return { success: true, notificationId: notification._id };
  } catch (error) {
    console.error("Error sending SMS receipt:", error);
    return { success: false, error: "Failed to send SMS receipt" };
  }
});

// Send receipt via Email
export const sendEmailReceipt = withSubscriptionCheckByStoreId(async (storeId: string, saleId: string, email: string) => {
  try {
    await connectToDB();
    
    const sale = await Sale.findOne({ 
      _id: new mongoose.Types.ObjectId(saleId), 
      storeId: new mongoose.Types.ObjectId(storeId) 
    } as any).lean();
    
    if (!sale) {
      return { success: false, error: "Sale not found" };
    }
    
    const subject = `Receipt #${sale.saleNumber}`;
    const message = generateEmailReceipt(sale);
    
    const notification = await Notification.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: sale.branchId,
      type: 'email',
      recipient: email,
      subject,
      message,
      relatedSaleId: sale._id,
      metadata: { saleNumber: sale.saleNumber, total: sale.total }
    });
    
    // Here you would integrate with email service (SendGrid, etc.)
    // For now, we'll mark as sent
    await Notification.findByIdAndUpdate(notification._id, {
      status: 'sent',
      sentAt: new Date()
    });
    
    return { success: true, notificationId: notification._id };
  } catch (error) {
    console.error("Error sending email receipt:", error);
    return { success: false, error: "Failed to send email receipt" };
  }
});

// Get notification history
export const getNotificationHistory = withSubscriptionCheckByStoreId(async (storeId: string, branchId?: string) => {
  try {
    await connectToDB();
    const query = branchId ? { storeId, branchId } : { storeId };
    
    const notifications = await Notification.find(query as any)
      .populate('relatedSaleId', 'saleNumber total')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return [];
  }
});

// Helper function to generate email receipt HTML
function generateEmailReceipt(sale: any): string {
  const itemsHtml = sale.items.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Receipt #${sale.saleNumber}</h2>
        <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${sale.customerName || 'Walk-in Customer'}</p>
        
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px;">
          <p><strong>Subtotal:</strong> $${sale.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${sale.tax.toFixed(2)}</p>
          <p><strong>Discount:</strong> $${sale.discount.toFixed(2)}</p>
          <h3><strong>Total:</strong> $${sale.total.toFixed(2)}</h3>
        </div>
        
        <p style="margin-top: 30px;">Thank you for your business!</p>
      </body>
    </html>
  `;
}