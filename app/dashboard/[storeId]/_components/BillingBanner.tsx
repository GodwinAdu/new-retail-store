"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getBillingInfo } from "@/lib/actions/billing.actions";

interface BillingBannerProps {
    storeId: string;
}

export default function BillingBanner({ storeId }: BillingBannerProps) {
    const [billingInfo, setBillingInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingInfo = async () => {
            try {
                const info = await getBillingInfo(storeId);
                setBillingInfo(info);
            } catch (error) {
                console.error("Error fetching billing info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingInfo();
    }, [storeId]);

    if (loading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-1/3"></div>
            </div>
        );
    }

    if (!billingInfo) return null;

    const isOverdue = billingInfo.status === 'overdue';
    const isTrialExpired = billingInfo.status === 'trial_expired';
    const isOnTrial = billingInfo.status === 'trial';
    const isActive = billingInfo.status === 'active';

    return (
        <div className={`border rounded-xl p-4 mb-6 ${
            isOverdue || isTrialExpired
                ? 'bg-red-50 border-red-200' 
                : isOnTrial
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOverdue || isTrialExpired ? 'bg-red-100' : isOnTrial ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                        {isOverdue || isTrialExpired ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                            <CreditCard className={`w-5 h-5 ${isOnTrial ? 'text-green-600' : 'text-blue-600'}`} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-lg font-semibold ${
                                isOverdue || isTrialExpired ? 'text-red-900' : isOnTrial ? 'text-green-900' : 'text-blue-900'
                            }`}>
                                {isOnTrial ? 'Free Trial Active' : `Monthly Bill: ${billingInfo.currency}${billingInfo.monthlyTotal}`}
                            </span>
                            {!isOnTrial && (
                                <span className={`text-sm ${
                                    isOverdue || isTrialExpired ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                    ({billingInfo.branchCount} branches × {billingInfo.currency}{billingInfo.pricePerBranch})
                                </span>
                            )}
                        </div>
                        <p className={`text-sm ${
                            isOverdue || isTrialExpired ? 'text-red-600' : isOnTrial ? 'text-green-600' : 'text-blue-600'
                        }`}>
                            {isOverdue 
                                ? 'Payment overdue - Please update your billing'
                                : isTrialExpired
                                ? 'Free trial expired - Please subscribe to continue'
                                : isOnTrial
                                ? `Trial ends: ${new Date(billingInfo.trialEndsAt).toLocaleDateString()}`
                                : `Next billing: ${new Date(billingInfo.nextBillingDate).toLocaleDateString()}`
                            }
                        </p>
                    </div>
                </div>
                
                <Link href={`/dashboard/${storeId}/billing`}>
                    <Button 
                        size="sm" 
                        className={
                            isOverdue || isTrialExpired
                                ? 'bg-red-600 hover:bg-red-700' 
                                : isOnTrial
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {isOverdue || isTrialExpired ? 'Pay Now' : 'View Billing'}
                    </Button>
                </Link>
            </div>
        </div>
    );
}