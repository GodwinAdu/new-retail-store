"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import Store from "../models/store.models";
import { validateTokenSecretKey } from "../utils/env-validation";

// Validate environment on module load
validateTokenSecretKey();

const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function currentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const { payload } = await jwtVerify(token, SECRET_KEY);
        
        if (!payload.userId) {
            return null;
        }

        await connectToDB();
        
        const user = await User.findById(payload.userId).populate({path:'storeId', select:'name',model:Store});
        
        if (!user) {
            return null;
        }

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}