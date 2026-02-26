"use server";

import { connectToDB } from "@/lib/mongoose";
import Category from "@/lib/models/category.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

export const getCategories = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const categories = await Category.find({ store: storeId }).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

export const createCategory = withSubscriptionCheckByStoreId(async (storeId: string, categoryData: any) => {
  try {
    await connectToDB();
    const category = await Category.create({ ...categoryData, store: storeId });
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
});

export const deleteCategory = withSubscriptionCheckByStoreId(async (storeId: string, categoryId: string) => {
  try {
    await connectToDB();
    const result = await Category.findOneAndDelete({ _id: categoryId, store: storeId });
    if (!result) {
      return { success: false, error: "Category not found" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
});