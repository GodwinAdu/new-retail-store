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
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
});

export const deleteCategory = withSubscriptionCheckByStoreId(async (storeId: string, categoryId: string) => {
  try {
    await connectToDB();
    await Category.findOneAndDelete({ _id: categoryId, store: storeId });
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
});