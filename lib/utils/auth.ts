"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDB } from "../mongoose";
import User from "../models/user.models";
import { validateTokenSecretKey } from "../utils/env-validation";

// Validate environment on module load
validateTokenSecretKey();

const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY!);

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    await connectToDB();
    const user = await User.findById(payload.userId).select("-password");
    
    return user ? {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      storeId: user.storeId?.toString() || null,
    } : null;
  } catch (error) {
    return null;
  }
}