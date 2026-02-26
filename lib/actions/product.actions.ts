"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import Category from "../models/category.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

export const getProducts = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const products = await Product.find({ storeId })
      .populate({path:'categoryId', model:Category, select:'name color'})
      .lean();
    
    // Map categoryId to category for consistency
    const productsWithCategory = products.map(product => ({
      ...product,
      category: product.categoryId,
      categoryId: product.categoryId?._id
    }));
    
    return JSON.parse(JSON.stringify(productsWithCategory));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
});

export const createProduct = withSubscriptionCheckByStoreId(async (storeId: string, productData: any) => {
  try {
    await connectToDB();
    const product = await Product.create({ ...productData, storeId });
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
});

export const updateProduct = withSubscriptionCheckByStoreId(async (storeId: string, productId: string, updateData: any) => {
  try {
    await connectToDB();
    const product = await Product.findOneAndUpdate(
      { _id: productId, storeId }, 
      updateData, 
      { new: true }
    );
    if (!product) {
      return { success: false, error: "Product not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
});

export const deleteProduct = withSubscriptionCheckByStoreId(async (storeId: string, productId: string) => {
  try {
    await connectToDB();
    const result = await Product.findOneAndDelete({ _id: productId, storeId });
    if (!result) {
      return { success: false, error: "Product not found" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message || "Failed to delete product" };
  }
});

export const getProductByBarcode = withSubscriptionCheckByStoreId(async (storeId: string, barcode: string) => {
  try {
    await connectToDB();
    const product = await Product.findOne({ barcode, storeId }).lean();
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return null;
  }
});

export const updateProductStock = withSubscriptionCheckByStoreId(async (storeId: string, productId: string, quantity: number) => {
  try {
    await connectToDB();
    await Product.findOneAndUpdate(
      { _id: productId, storeId }, 
      { $inc: { stock: -quantity } }
    );
    return true;
  } catch (error) {
    console.error("Error updating product stock:", error);
    return false;
  }
});