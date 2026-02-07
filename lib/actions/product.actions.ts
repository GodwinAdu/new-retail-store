"use server";

import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import Category from "../models/category.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

export const getProducts = withSubscriptionCheckByStoreId(async (storeId: string) => {
  try {
    await connectToDB();
    const products = await Product.find({ storeId })
      .populate({path:'categoryId',model:Category, select:'name'})
      .lean();
      console.log(products);
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
});

export const createProduct = withSubscriptionCheckByStoreId(async (storeId: string, productData: any) => {
  try {
    await connectToDB();
    const product = await Product.create({ ...productData, storeId });
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
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
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
});

export const deleteProduct = withSubscriptionCheckByStoreId(async (storeId: string, productId: string) => {
  try {
    await connectToDB();
    await Product.findOneAndDelete({ _id: productId, storeId });
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
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