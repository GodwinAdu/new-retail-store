import { NextRequest, NextResponse } from "next/server";
import { syncOfflineSales, storeOfflineSale } from "@/lib/actions/offline.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, storeId, branchId, saleData, localId, deviceId } = body;

    if (action === "store") {
      const result = await storeOfflineSale(storeId, branchId, saleData, localId, deviceId);
      return NextResponse.json(result);
    }

    if (action === "sync") {
      const result = await syncOfflineSales(storeId, branchId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Offline sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}