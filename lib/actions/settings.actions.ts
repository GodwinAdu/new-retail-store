"use server";

import { connectToDB } from "../mongoose";
import Store from "../models/store.models";
import User from "../models/user.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

export const getStoreSettings = withSubscriptionCheckByStoreId(async (storeId: string) => {
    try {
        await connectToDB();
        const store = await Store.findById(storeId).lean();
        if (!store) return null;
        return JSON.parse(JSON.stringify(store));
    } catch (error) {
        console.error("Error fetching store settings:", error);
        return null;
    }
});

export const updateStoreSettings = withSubscriptionCheckByStoreId(async (storeId: string, data: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    posSettings?: any;
    inventorySettings?: any;
}) => {
    try {
        await connectToDB();

        // Map form field names to schema field names
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.storeAddress !== undefined) updateData.storeAddress = data.storeAddress;

        // Handle phone - form sends "phone", schema uses "storePhone"
        if (data.storePhone !== undefined) updateData.storePhone = data.storePhone;
        else if (data.phone !== undefined) updateData.storePhone = data.phone;

        // Handle email - form sends "email", schema uses "storeEmail"
        if (data.storeEmail !== undefined) updateData.storeEmail = data.storeEmail;
        else if (data.email !== undefined) updateData.storeEmail = data.email;

        if (data.posSettings !== undefined) updateData.posSettings = data.posSettings;
        if (data.inventorySettings !== undefined) updateData.inventorySettings = data.inventorySettings;

        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { $set: updateData },
            { new: true }
        ).lean();

        return { success: true, data: JSON.parse(JSON.stringify(updatedStore)) };
    } catch (error: any) {
        console.error("Error updating store settings:", error);
        return { success: false, error: error.message || "Failed to update store settings" };
    }
});

export async function updateUserProfile(userId: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
}) {
    try {
        await connectToDB();

        // Map form field names to schema field names
        const updateData: any = {};
        if (data.fullName !== undefined) updateData.fullName = data.fullName;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phoneNumber = data.phone;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).lean();

        return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message || "Failed to update user profile" };
    }
}
