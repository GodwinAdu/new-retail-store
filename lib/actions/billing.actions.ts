"use server";

import { connectToDB } from "../mongoose";
import Store from "../models/store.models";

export async function getBillingInfo(storeId: string) {
    try {
        await connectToDB();
        
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error("Store not found");
        }

        const monthlyPrice = 80; // ₵80 per store per month
        
        const now = new Date();
        const trialEndsAt = new Date(store.subscriptionPlan.trialEndsAt);
        const subscriptionExpiry = new Date(store.subscriptionPlan.subscriptionExpiry);
        
        // Determine if payment is due
        const isTrialExpired = now > trialEndsAt;
        const isSubscriptionExpired = now > subscriptionExpiry;
        const isBlocked = store.subscriptionPlan.isBlocked;
        const paymentStatus = store.subscriptionPlan.paymentStatus;
        
        // Determine status
        let status = "active";
        if (isBlocked) {
            status = "overdue";
        } else if (isTrialExpired && paymentStatus === 'Free Trial') {
            status = "trial_expired";
        } else if (isSubscriptionExpired) {
            status = "overdue";
        } else if (!isTrialExpired) {
            status = "trial";
        }
        
        return {
            monthlyTotal: monthlyPrice,
            pricePerBranch: monthlyPrice,
            branchCount: 1,
            currency: "GH₵",
            nextBillingDate: subscriptionExpiry,
            trialEndsAt,
            status,
            paymentStatus,
            isBlocked,
            paymentHistory: store.paymentHistory || []
        };
    } catch (error) {
        console.error("Error fetching billing info:", error);
        throw new Error("Failed to fetch billing info");
    }
}

export async function getPaymentHistory(storeId: string) {
    try {
        await connectToDB();
        
        const store = await Store.findById(storeId).select('paymentHistory');
        if (!store) {
            throw new Error("Store not found");
        }

        return store.paymentHistory || [];
    } catch (error) {
        console.error("Error fetching payment history:", error);
        throw new Error("Failed to fetch payment history");
    }
}

export async function initializePayment(storeId: string, userEmail: string) {
    try {
        await connectToDB();
        
        const billingInfo = await getBillingInfo(storeId);
        const { PaystackService } = await import("../paystack");
        
        const reference = PaystackService.generateReference(storeId);
        const paymentData = {
            email: userEmail,
            amount: billingInfo.monthlyPrice,
            reference,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${storeId}/billing/verify?reference=${reference}`,
            metadata: {
                storeId,
                userId: userEmail,
                plan: 'retail_monthly'
            }
        };

        const response = await PaystackService.initializePayment(paymentData);
        return response;
    } catch (error) {
        console.error("Error initializing payment:", error);
        throw new Error("Failed to initialize payment");
    }
}

export async function verifyPayment(reference: string) {
    try {
        const { PaystackService } = await import("../paystack");
        const verification = await PaystackService.verifyPayment(reference);
        
        if (verification.status && verification.data.status === 'success') {
            const { storeId } = verification.data.metadata;
            
            await connectToDB();
            const store = await Store.findById(storeId);
            
            if (store) {
                const paymentRecord = {
                    reference: verification.data.reference,
                    amount: verification.data.amount / 100,
                    status: 'success',
                    paymentMethod: 'paystack',
                    paidAt: new Date(verification.data.paid_at),
                    gateway_response: verification.data.gateway_response
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
        
        return verification;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw new Error("Failed to verify payment");
    }
}