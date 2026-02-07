"use server";

import { connectToDB } from "@/lib/mongoose";
import SocialPost from "@/lib/models/social-post.models";
import Product from "@/lib/models/product.models";
import Sale from "@/lib/models/sale.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import mongoose from "mongoose";

// Create social media post
export const createSocialPost = withSubscriptionCheckByStoreId(async (storeId: string, branchId: string, postData: {
  platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp';
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledFor?: Date;
  relatedProductIds?: string[];
  accessToken?: string;
  publishNow?: boolean;
}) => {
  try {
    await connectToDB();
    
    const post = await SocialPost.create({
      ...postData,
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: new mongoose.Types.ObjectId(branchId),
      relatedProductIds: postData.relatedProductIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
      status: postData.publishNow ? 'pending' : 'draft'
    } as any);
    
    // Actually post to social media if publishNow is true
    if (postData.publishNow && postData.accessToken) {
      try {
        const { SocialMediaAPI } = await import("@/lib/utils/social-api");
        let result;
        
        switch (postData.platform) {
          case 'facebook':
            result = await SocialMediaAPI.postToFacebook(postData.accessToken, postData.content, postData.mediaUrls);
            break;
          case 'twitter':
            result = await SocialMediaAPI.postToTwitter(postData.accessToken, postData.content);
            break;
          case 'whatsapp':
            // WhatsApp requires phone number - would need to be passed in
            break;
        }
        
        if (result?.id) {
          await SocialPost.findByIdAndUpdate(post._id, {
            status: 'posted',
            postId: result.id
          });
        }
      } catch (apiError) {
        await SocialPost.findByIdAndUpdate(post._id, {
          status: 'failed',
          errorMessage: apiError instanceof Error ? apiError.message : 'Unknown error'
        });
      }
    }
    
    return { success: true, post: JSON.parse(JSON.stringify(post)) };
  } catch (error) {
    console.error("Error creating social post:", error);
    return { success: false, error: "Failed to create social post" };
  }
});

// Generate product promotion post
export const generateProductPromotion = withSubscriptionCheckByStoreId(async (storeId: string, branchId: string, productId: string, platform: string) => {
  try {
    await connectToDB();
    
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: new mongoose.Types.ObjectId(branchId)
    } as any).lean();
    
    if (!product) {
      return { success: false, error: "Product not found" };
    }
    
    const content = generatePromotionContent(product, platform);
    const hashtags = generateHashtags(product);
    
    return {
      success: true,
      content,
      hashtags,
      mediaUrls: product.image ? [product.image] : []
    };
  } catch (error) {
    console.error("Error generating product promotion:", error);
    return { success: false, error: "Failed to generate promotion" };
  }
});

// Generate daily sales summary post
export const generateDailySummaryPost = withSubscriptionCheckByStoreId(async (storeId: string, branchId: string, date: Date) => {
  try {
    await connectToDB();
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const sales = await Sale.find({
      storeId: new mongoose.Types.ObjectId(storeId),
      branchId: new mongoose.Types.ObjectId(branchId),
      status: 'completed',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    } as any).lean();
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    
    const content = `🎉 Daily Update! Today we served ${totalSales} happy customers and generated $${totalRevenue.toFixed(2)} in sales! Thank you for your continued support! 💪 #DailyUpdate #ThankYou #Business`;
    
    return {
      success: true,
      content,
      hashtags: ['DailyUpdate', 'ThankYou', 'Business'],
      stats: { totalRevenue, totalSales }
    };
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return { success: false, error: "Failed to generate daily summary" };
  }
});

// Get social media analytics
export const getSocialMediaAnalytics = withSubscriptionCheckByStoreId(async (storeId: string, branchId?: string) => {
  try {
    await connectToDB();
    const query = branchId ? { storeId, branchId } : { storeId };
    
    const posts = await SocialPost.find(query as any).lean();
    
    const analytics = {
      totalPosts: posts.length,
      byPlatform: {} as Record<string, number>,
      totalEngagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        reach: 0
      },
      recentPosts: posts.slice(-10)
    };
    
    posts.forEach(post => {
      analytics.byPlatform[post.platform] = (analytics.byPlatform[post.platform] || 0) + 1;
      analytics.totalEngagement.likes += post.engagement.likes;
      analytics.totalEngagement.shares += post.engagement.shares;
      analytics.totalEngagement.comments += post.engagement.comments;
      analytics.totalEngagement.reach += post.engagement.reach;
    });
    
    return JSON.parse(JSON.stringify(analytics));
  } catch (error) {
    console.error("Error getting social media analytics:", error);
    return { totalPosts: 0, byPlatform: {}, totalEngagement: { likes: 0, shares: 0, comments: 0, reach: 0 }, recentPosts: [] };
  }
});

// Helper functions
function generatePromotionContent(product: any, platform: string): string {
  const templates = {
    facebook: `🔥 Special Offer Alert! 🔥\n\nGet ${product.name} for just $${product.price}!\n\n${product.description || 'Amazing quality and great value!'}\n\nVisit us today! Limited time offer.`,
    instagram: `✨ ${product.name} ✨\n\nOnly $${product.price} 💰\n\n${product.description || 'Perfect for you!'}\n\nDM us to order! 📱`,
    twitter: `🔥 ${product.name} - $${product.price}\n\n${product.description || 'Great deal!'}\n\nGet yours today!`,
    whatsapp: `Hi! 👋\n\nSpecial offer on ${product.name}!\nPrice: $${product.price}\n\n${product.description || 'Limited time offer!'}\n\nReply to order now! 🛒`
  };
  
  return templates[platform as keyof typeof templates] || templates.facebook;
}

function generateHashtags(product: any): string[] {
  const baseHashtags = ['Sale', 'SpecialOffer', 'Shopping', 'Deal'];
  const productHashtags = product.name.split(' ').map((word: string) => word.replace(/[^a-zA-Z0-9]/g, ''));
  
  return [...baseHashtags, ...productHashtags.slice(0, 3)];
}