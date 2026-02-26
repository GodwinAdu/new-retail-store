"use server"

import { hash, compare } from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDB } from "../mongoose";
import User from "../models/user.models";
import Store from "../models/store.models";
import { generateUniqueUsername } from "../helpers/generate-username";
import { Types } from "mongoose";
import { validatePassword, validateEmail, sanitizeInput } from "../utils/validation";
import { validateTokenSecretKey } from "../utils/env-validation";

// Validate environment on module load
validateTokenSecretKey();

const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY!);

interface SignUpData {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    storeName: string;
    storeEmail: string;
    storePhone?: string;
    storeAddress?: string;
}

interface SignInData {
    email: string;
    password: string;
}

export async function signUp(data: SignUpData) {
    try {
        if (!process.env.TOKEN_SECRET_KEY) {
            throw new Error("TOKEN_SECRET_KEY environment variable is required");
        }
        
        await connectToDB();

        // Validate email format
        if (!validateEmail(data.email)) {
            throw new Error("Invalid email format");
        }

        if (!validateEmail(data.storeEmail)) {
            throw new Error("Invalid store email format");
        }

        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join('. '));
        }

        // Sanitize inputs
        const sanitizedData = {
            fullName: sanitizeInput(data.fullName),
            email: data.email.toLowerCase().trim(),
            storeName: sanitizeInput(data.storeName),
            storeEmail: data.storeEmail.toLowerCase().trim(),
            storePhone: data.storePhone ? sanitizeInput(data.storePhone) : undefined,
            storeAddress: data.storeAddress ? sanitizeInput(data.storeAddress) : undefined,
            phoneNumber: data.phoneNumber ? sanitizeInput(data.phoneNumber) : undefined,
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: sanitizedData.email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Check if store email already exists
        const existingStore = await Store.findOne({ storeEmail: sanitizedData.storeEmail });
        if (existingStore) {
            throw new Error("Store with this email already exists");
        }

        // Hash password
        const hashedPassword = await hash(data.password, 12);

        // Create store first
        const store = new Store({
            name: sanitizedData.storeName,
            storeEmail: sanitizedData.storeEmail,
            storePhone: sanitizedData.storePhone,
            storeAddress: sanitizedData.storeAddress,
            owner: null, // Will be set after user creation
        });

        const savedStore = await store.save();

        // Create user as owner
        const user = new User({
            username: generateUniqueUsername(sanitizedData.fullName),
            fullName: sanitizedData.fullName,
            email: sanitizedData.email,
            phoneNumber: sanitizedData.phoneNumber,
            password: hashedPassword,
            role: 'owner',
            storeId: savedStore._id,
            isVerified: true,
            isActive: true,
        });

        const savedUser = await user.save();

        // Update store with owner
        savedStore.owner = savedUser._id as any;
        await savedStore.save();

        // Create JWT token
        const token = await new SignJWT({
            userId: savedUser._id.toString(),
            email: savedUser.email,
            role: savedUser.role,
            storeId: savedStore._id.toString(),
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(SECRET_KEY);

        // Set cookies
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return {
            success: true,
            user: {
                id: savedUser._id.toString(),
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role,
                storeId: savedStore._id.toString(),
            },
            store: {
                id: savedStore._id.toString(),
                name: savedStore.name,
            },
            redirectUrl: `/dashboard/${savedStore._id.toString()}`
        };

    } catch (error) {
        console.error("Sign up error:", error);
        throw error;
    }
}

export async function signIn(data: SignInData) {
    try {
        await connectToDB();

        // Find user
        const user = await User.findOne({ email: data.email }).populate({path:'storeId',model:Store});
        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Check password
        const isValidPassword = await compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error("Account is deactivated. Please contact administrator.");
        }

        // Check if store is banned
        if (user.storeId && typeof user.storeId === 'object' && 'banned' in user.storeId && user.storeId.banned) {
            throw new Error("Store is suspended. Please contact support.");
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create JWT token
        const storeId = typeof user.storeId === 'object' && '_id' in user.storeId ? (user.storeId as any)._id.toString() : user.storeId.toString();
        const token = await new SignJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            storeId,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(SECRET_KEY);

        // Set cookies
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
        });

        // Always redirect to dashboard
        const redirectUrl = `/dashboard/${storeId}`;

        return {
            success: true,
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                storeId: storeId,
            },
            redirectUrl
        };

    } catch (error) {
        console.error("Sign in error:", error);
        throw error;
    }
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    redirect("/sign-in");
}