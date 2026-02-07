import { NextRequest, NextResponse } from "next/server";
import { checkSubscriptionStatus } from "@/lib/utils/subscription-guard";

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();
    const status = await checkSubscriptionStatus(storeId);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in subscription status API:", error);
    return NextResponse.json(
      { 
        isActive: false,
        isExpired: true,
        isBlocked: true,
        daysRemaining: 0,
        gracePeriodDays: 0,
        message: "Error checking subscription status"
      },
      { status: 500 }
    );
  }
}