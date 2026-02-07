"use server";

import { connectToDB } from "@/lib/mongoose";
import Sale from "@/lib/models/sale.models";
import Customer from "@/lib/models/customer.models";
import Product from "@/lib/models/product.models";
import Category from "@/lib/models/category.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

function getDateRange(range: string) {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'this_week':
      const dayOfWeek = now.getDay();
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_week':
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'last_3_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_6_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    default: // this_month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate.setHours(23, 59, 59, 999);
  }
  
  return { startDate, endDate };
}

export const getReportStats = withSubscriptionCheckByStoreId(async (storeId: string, dateRange: string = 'this_month') => {
  try {
    await connectToDB();
    
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get comparison period
    const periodLength = endDate.getTime() - startDate.getTime();
    const comparisonStart = new Date(startDate.getTime() - periodLength);
    const comparisonEnd = new Date(startDate.getTime() - 1);
    
    // Current period data
    const currentSales = await Sale.find({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
    
    // Comparison period data
    const comparisonSales = await Sale.find({
      storeId,
      createdAt: { $gte: comparisonStart, $lte: comparisonEnd }
    }).lean();
    
    // New customers in period
    const newCustomers = await Customer.countDocuments({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const comparisonNewCustomers = await Customer.countDocuments({
      storeId,
      createdAt: { $gte: comparisonStart, $lte: comparisonEnd }
    });
    
    const totalRevenue = currentSales.reduce((sum, sale) => sum + sale.total, 0);
    const comparisonRevenue = comparisonSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = currentSales.length;
    const comparisonOrders = comparisonSales.length;
    const totalProducts = currentSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const comparisonProducts = comparisonSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const comparisonAvgOrderValue = comparisonOrders > 0 ? comparisonRevenue / comparisonOrders : 0;
    
    return {
      totalRevenue,
      revenueGrowth: comparisonRevenue > 0 ? ((totalRevenue - comparisonRevenue) / comparisonRevenue * 100) : 0,
      totalOrders,
      ordersGrowth: comparisonOrders > 0 ? ((totalOrders - comparisonOrders) / comparisonOrders * 100) : 0,
      newCustomers,
      customersGrowth: comparisonNewCustomers > 0 ? ((newCustomers - comparisonNewCustomers) / comparisonNewCustomers * 100) : 0,
      totalProducts,
      productsGrowth: comparisonProducts > 0 ? ((totalProducts - comparisonProducts) / comparisonProducts * 100) : 0,
      avgOrderValue,
      avgOrderValueGrowth: comparisonAvgOrderValue > 0 ? ((avgOrderValue - comparisonAvgOrderValue) / comparisonAvgOrderValue * 100) : 0
    };
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      ordersGrowth: 0,
      newCustomers: 0,
      customersGrowth: 0,
      totalProducts: 0,
      productsGrowth: 0,
      avgOrderValue: 0,
      avgOrderValueGrowth: 0
    };
  }
});

export async function getSalesChart(storeId: string, dateRange: string = 'last_6_months') {
  try {
    await connectToDB();
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const sales = await Sale.find({
      storeId,
      createdAt: { $gte: sixMonthsAgo }
    }).lean();
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthSales = sales.filter(sale => 
        new Date(sale.createdAt) >= monthStart && new Date(sale.createdAt) < monthEnd
      );
      
      const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
      const profit = revenue * 0.3; // Assume 30% profit margin
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        sales: revenue,
        profit
      });
    }
    
    return monthlyData;
  } catch (error) {
    console.error("Error fetching sales chart:", error);
    return [];
  }
}

export async function getCategoryStats(storeId: string, dateRange: string = 'this_month') {
  const { startDate, endDate } = getDateRange(dateRange);
  try {
    await connectToDB();
    
    const categories = await Category.find({ storeId }).lean();
    const sales = await Sale.find({ 
      storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.find({ categoryId: category._id }).lean();
        const productIds = products.map(p => p._id.toString());
        
        const categoryRevenue = sales.reduce((sum, sale) => {
          const categoryItems = sale.items.filter(item => 
            productIds.includes(item.productId.toString())
          );
          return sum + categoryItems.reduce((itemSum, item) => 
            itemSum + (item.price * item.quantity), 0
          );
        }, 0);
        
        return {
          name: category.name,
          value: totalRevenue > 0 ? Math.round((categoryRevenue / totalRevenue) * 100) : 0,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      })
    );
    
    return categoryStats.filter(stat => stat.value > 0).slice(0, 5);
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return [];
  }
}