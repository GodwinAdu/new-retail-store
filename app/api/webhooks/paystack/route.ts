import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDB } from "@/lib/mongoose";
import Store from "@/lib/models/store.models";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature");

        if (!signature) {
            return NextResponse.json({ error: "No signature provided" }, { status: 400 });
        }

        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
            .update(body)
            .digest("hex");

        if (hash !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.event === "charge.success") {
            const { reference, amount, metadata, paid_at, id } = event.data;
            const { storeId } = metadata;

            await connectToDB();
            const store = await Store.findById(storeId);

            if (store) {
                const paymentRecord = {
                    reference,
                    amount: amount / 100,
                    status: 'success',
                    paymentMethod: 'paystack',
                    paidAt: new Date(paid_at),
                    transactionId: id || reference
                };

                store.paymentHistory.push(paymentRecord);
                
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                
                store.subscriptionPlan.paymentStatus = 'Paid';
                store.subscriptionPlan.subscriptionExpiry = nextMonth;
                store.subscriptionPlan.isBlocked = false;
                
                await store.save();
            }
        }

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}