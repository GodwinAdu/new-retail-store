import { NextRequest, NextResponse } from "next/server";
import { sendSMSReceipt, sendEmailReceipt } from "@/lib/actions/notification.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, storeId, saleId, recipient } = body;

    if (type === "sms") {
      const result = await sendSMSReceipt(storeId, saleId, recipient);
      return NextResponse.json(result);
    }

    if (type === "email") {
      const result = await sendEmailReceipt(storeId, saleId, recipient);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: "Invalid notification type" }, { status: 400 });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}