"use server";

import { connectToDB } from "../mongoose";
import Store from "../models/store.models";
import User from "../models/user.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";

export const getStoreSettings = withSubscriptionCheckByStoreId(async (storeId: string) => {
    try {
        await connectToDB();
        const store = await Store.findById(storeId);
        return store;
    } catch (error) {
        console.error("Error fetching store settings:", error);
        throw new Error("Failed to fetch store settings");
    }
});

export const updateStoreSettings = withSubscriptionCheckByStoreId(async (storeId: string, data: {
    name?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    posSettings?: any;
    inventorySettings?: any;
}) => {
    try {
        await connectToDB();
        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { $set: data },
            { new: true }
        );
        return updatedStore;
    } catch (error) {
        console.error("Error updating store settings:", error);
        throw new Error("Failed to update store settings");
    }
});

export async function updateUserProfile(userId: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
}) {
    try {
        await connectToDB();
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update user profile");
    }
}