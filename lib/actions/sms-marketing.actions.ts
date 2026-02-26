'use server';

import { connectToDB } from '@/lib/mongoose';
import SMSCampaign from '@/lib/models/sms-campaign.models';
import SMSTemplate from '@/lib/models/sms-template.models';
import Customer from '@/lib/models/customer.models';
import Sale from '@/lib/models/sale.models';
import { withSubscriptionCheckByStoreId } from '@/lib/utils/subscription-wrapper';
import mongoose from 'mongoose';

// SMS Provider Integration (Placeholder - integrate with Twilio, Africa's Talking, etc.)
async function sendSMS(phone: string, message: string) {
  // TODO: Integrate with actual SMS provider
  console.log(`Sending SMS to ${phone}: ${message}`);
  return { success: true, cost: 0.05 }; // Mock cost per SMS
}

export const createCampaign = withSubscriptionCheckByStoreId(
  async (storeId: string, userId: string, data: any) => {
    await connectToDB();
    
    const campaign = await SMSCampaign.create({
      storeId,
      createdBy: userId,
      ...data,
    });

    return { success: true, data: JSON.parse(JSON.stringify(campaign)) };
  },
);

export const getCampaigns = withSubscriptionCheckByStoreId(
  async (storeId: string) => {
    await connectToDB();
    
    const campaigns = await SMSCampaign.find({ storeId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(campaigns)) };
  },
  'VIEW_REPORTS'
);

export const getCampaignById = withSubscriptionCheckByStoreId(
  async (storeId: string, campaignId: string) => {
    await connectToDB();
    
    const campaign = await SMSCampaign.findOne({ _id: campaignId, storeId })
      .populate('createdBy', 'name email')
      .lean();

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    return { success: true, data: JSON.parse(JSON.stringify(campaign)) };
  },
  'VIEW_REPORTS'
);

export const updateCampaign = withSubscriptionCheckByStoreId(
  async (storeId: string, campaignId: string, data: any) => {
    await connectToDB();
    
    const campaign = await SMSCampaign.findOneAndUpdate(
      { _id: campaignId, storeId, status: 'draft' },
      data,
      { new: true }
    );

    if (!campaign) {
      return { success: false, error: 'Campaign not found or already sent' };
    }

    return { success: true, data: JSON.parse(JSON.stringify(campaign)) };
  },
  'MANAGE_MARKETING'
);

export const deleteCampaign = withSubscriptionCheckByStoreId(
  async (storeId: string, campaignId: string) => {
    await connectToDB();
    
    const campaign = await SMSCampaign.findOneAndDelete({
      _id: campaignId,
      storeId,
      status: { $in: ['draft', 'failed'] },
    });

    if (!campaign) {
      return { success: false, error: 'Campaign not found or cannot be deleted' };
    }

    return { success: true };
  },
  'MANAGE_MARKETING'
);

export const getRecipientCount = withSubscriptionCheckByStoreId(
  async (storeId: string, recipients: any) => {
    await connectToDB();
    
    let count = 0;

    if (recipients.type === 'all') {
      count = await Customer.countDocuments({ storeId });
    } else if (recipients.type === 'custom') {
      count = recipients.customerIds?.length || 0;
    } else if (recipients.type === 'segment') {
      const query: any = { storeId };
      const segment = recipients.segment;

      // Get customer purchase stats
      const customers = await Customer.find(query).lean();
      const customerIds = customers.map(c => c._id);

      const salesAgg = await Sale.aggregate([
        { $match: { storeId: new mongoose.Types.ObjectId(storeId), customerId: { $in: customerIds } } },
        {
          $group: {
            _id: '$customerId',
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            lastPurchase: { $max: '$createdAt' },
          },
        },
      ]);

      const filtered = salesAgg.filter(stat => {
        if (segment.minPurchases && stat.totalPurchases < segment.minPurchases) return false;
        if (segment.maxPurchases && stat.totalPurchases > segment.maxPurchases) return false;
        if (segment.minSpent && stat.totalSpent < segment.minSpent) return false;
        if (segment.maxSpent && stat.totalSpent > segment.maxSpent) return false;
        if (segment.lastPurchaseDays) {
          const daysSince = (Date.now() - new Date(stat.lastPurchase).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > segment.lastPurchaseDays) return false;
        }
        return true;
      });

      count = filtered.length;
    }

    return { success: true, data: count };
  },
  'VIEW_REPORTS'
);

export const sendCampaign = withSubscriptionCheckByStoreId(
  async (storeId: string, campaignId: string) => {
    await connectToDB();
    
    const campaign = await SMSCampaign.findOne({ _id: campaignId, storeId });

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return { success: false, error: 'Campaign already sent or in progress' };
    }

    // Get recipients
    let customers: any[] = [];

    if (campaign.recipients.type === 'all') {
      customers = await Customer.find({ storeId }).lean();
    } else if (campaign.recipients.type === 'custom') {
      customers = await Customer.find({ _id: { $in: campaign.recipients.customerIds } }).lean();
    } else if (campaign.recipients.type === 'segment') {
      const segment = campaign.recipients.segment;
      const allCustomers = await Customer.find({ storeId }).lean();
      const customerIds = allCustomers.map(c => c._id);

      const salesAgg = await Sale.aggregate([
        { $match: { storeId: new mongoose.Types.ObjectId(storeId), customerId: { $in: customerIds } } },
        {
          $group: {
            _id: '$customerId',
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            lastPurchase: { $max: '$createdAt' },
          },
        },
      ]);

      const filteredIds = salesAgg
        .filter(stat => {
          if (segment?.minPurchases && stat.totalPurchases < segment.minPurchases) return false;
          if (segment?.maxPurchases && stat.totalPurchases > segment.maxPurchases) return false;
          if (segment?.minSpent && stat.totalSpent < segment.minSpent) return false;
          if (segment?.maxSpent && stat.totalSpent > segment.maxSpent) return false;
          if (segment?.lastPurchaseDays) {
            const daysSince = (Date.now() - new Date(stat.lastPurchase).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > segment.lastPurchaseDays) return false;
          }
          return true;
        })
        .map(stat => stat._id);

      customers = allCustomers.filter(c => filteredIds.some(id => id.equals(c._id)));
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.stats.total = customers.length;
    await campaign.save();

    // Send SMS to each customer
    let sent = 0;
    let failed = 0;
    let totalCost = 0;

    for (const customer of customers) {
      if (!customer.phone) {
        failed++;
        continue;
      }

      try {
        const result = await sendSMS(customer.phone, campaign.message);
        if (result.success) {
          sent++;
          totalCost += result.cost;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    // Update campaign stats
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.stats.sent = sent;
    campaign.stats.failed = failed;
    campaign.stats.cost = totalCost;
    await campaign.save();

    return { success: true, data: { sent, failed, cost: totalCost } };
  },
  'MANAGE_MARKETING'
);

// Templates
export const createTemplate = withSubscriptionCheckByStoreId(
  async (storeId: string, data: any) => {
    await connectToDB();
    
    const template = await SMSTemplate.create({ storeId, ...data });

    return { success: true, data: JSON.parse(JSON.stringify(template)) };
  },
  'MANAGE_MARKETING'
);

export const getTemplates = withSubscriptionCheckByStoreId(
  async (storeId: string) => {
    await connectToDB();
    
    const templates = await SMSTemplate.find({ storeId }).sort({ createdAt: -1 }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(templates)) };
  },
  'VIEW_REPORTS'
);

export const deleteTemplate = withSubscriptionCheckByStoreId(
  async (storeId: string, templateId: string) => {
    await connectToDB();
    
    await SMSTemplate.findOneAndDelete({ _id: templateId, storeId });

    return { success: true };
  },
  'MANAGE_MARKETING'
);
