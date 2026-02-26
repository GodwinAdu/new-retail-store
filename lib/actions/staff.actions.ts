"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.models";
import { withSubscriptionCheckByStoreId } from "@/lib/utils/subscription-wrapper";
import {hash} from "bcryptjs"


export const getStaffMembers = withSubscriptionCheckByStoreId(async (storeId: string) => {
    try {
        await connectToDB();
        
        const staff = await User.find({
            storeId,
            role: { $in: ['manager', 'sales_associate', 'cashier', 'inventory_manager'] }
        } as any).select('fullName email role phoneNumber isActive createdAt');
        
        return JSON.parse(JSON.stringify(staff));
    } catch (error) {
        console.error("Error fetching staff:", error);
        throw new Error("Failed to fetch staff members");
    }
});

export const getStaffStats = withSubscriptionCheckByStoreId(async (storeId: string) => {
    try {
        await connectToDB();
        
        const totalStaff = await User.countDocuments({
            storeId,
            role: { $in: ['manager', 'sales_associate', 'cashier', 'inventory_manager'] }
        } as any);
        
        const activeStaff = await User.countDocuments({
            storeId,
            role: { $in: ['manager', 'sales_associate', 'cashier', 'inventory_manager'] },
            isActive: true
        } as any);
        
        return {
            totalStaff,
            activeStaff,
            onBreak: Math.floor(Math.random() * 3),
            avgHours: 38.7
        };
    } catch (error) {
        console.error("Error fetching staff stats:", error);
        throw new Error("Failed to fetch staff statistics");
    }
});

export const createStaffMember = withSubscriptionCheckByStoreId(async (storeId: string, data: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    password: string;
}) => {
    try {
        await connectToDB();
        
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        
        
        const hashedPassword = await hash(data.password, 12);
        
        const username = data.email.split('@')[0].toLowerCase();
        
        const newUser = new User({
            username,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phone,
            role: data.role,
            password: hashedPassword,
            storeId,
            isActive: true
        });
        
        await newUser.save();
        return  JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        console.error("Error creating staff member:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to create staff member");
    }
});

export const updateStaffMember = withSubscriptionCheckByStoreId(async (storeId: string, userId: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
}) => {
    try {
        await connectToDB();
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, storeId } as any,
            { $set: data },
            { new: true }
        );
        
        if (!updatedUser) {
            throw new Error("Staff member not found");
        }
        
        return updatedUser;
    } catch (error) {
        console.error("Error updating staff member:", error);
        throw new Error("Failed to update staff member");
    }
});

export const deleteStaffMember = withSubscriptionCheckByStoreId(async (storeId: string, userId: string) => {
    try {
        await connectToDB();
        
        const deletedUser = await User.findOneAndDelete({ _id: userId, storeId } as any);
        
        if (!deletedUser) {
            throw new Error("Staff member not found");
        }
        
        return deletedUser;
    } catch (error) {
        console.error("Error deleting staff member:", error);
        throw new Error("Failed to delete staff member");
    }
});