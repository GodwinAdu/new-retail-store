"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Building2, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBillingInfo, initializePayment } from "@/lib/actions/billing.actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface BillingClientProps {
    user: any;
}

export default function BillingClient({  user }: BillingClientProps) {
    const [billingInfo, setBillingInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const params = useParams<{ storeId: string; branchId: string }>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const billing = await getBillingInfo(params.storeId);
                setBillingInfo(billing);
            } catch (error) {
                console.error("Error fetching billing data:", error);
               
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.storeId]);

    const handlePayment = async () => {
        setPaymentLoading(true);
        try {
            const response = await initializePayment(params.storeId, user.email);
            if (response.status) {
                window.location.href = response.data.authorization_url;
            } else {
                toast.error("Failed to initialize payment");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Failed to process payment");
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading billing information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={`/dashboard/${params.storeId}`}>
                                <Button variant="outline" size="sm" >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                                <p className="text-gray-300">Manage your monthly subscription</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Current Bill */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center mb-8">
                        {billingInfo?.status === 'trial' ? (
                            <>
                                <h2 className="text-3xl font-bold text-emerald-600 mb-2">
                                    Free Trial
                                </h2>
                                <p className="text-gray-300">30-Day Free Trial Active</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Trial ends: {billingInfo?.trialEndsAt ? new Date(billingInfo.trialEndsAt).toLocaleDateString() : 'N/A'}
                                </p>
                                <p className="text-sm text-emerald-600 mt-1">
                                    After trial: {billingInfo?.currency}{billingInfo?.monthlyTotal}/month
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {billingInfo?.currency}{billingInfo?.monthlyTotal}
                                </h2>
                                <p className="text-gray-300">Monthly Subscription</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Next billing date: {billingInfo?.nextBillingDate ? new Date(billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="text-center p-4 bg-green-500/20 rounded-xl">
                            <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{billingInfo?.currency}{billingInfo?.monthlyTotal}</div>
                            <p className="text-green-300 text-sm">Per Store/Month</p>
                        </div>
                        <div className="text-center p-4 bg-purple-500/20 rounded-xl">
                            <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">30</div>
                            <p className="text-purple-300 text-sm">Days in Cycle</p>
                        </div>
                    </div>

                    <div className="text-center">
                        {billingInfo?.isBlocked && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                                    <span className="font-semibold text-red-300">Account Blocked</span>
                                </div>
                                <p className="text-red-300 text-sm">Your account has been blocked due to overdue payment. Please pay to restore access.</p>
                            </div>
                        )}
                        
                        <Button 
                            onClick={handlePayment}
                            disabled={paymentLoading || billingInfo?.status === 'trial'}
                            className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 px-8 py-3 text-lg disabled:opacity-50"
                        >
                            {paymentLoading ? 'Processing...' : billingInfo?.status === 'trial' ? 'Trial Active' : `Pay ${billingInfo?.currency}${billingInfo?.monthlyTotal}`}
                        </Button>
                    </div>
                </motion.div>

                {/* Branch Breakdown */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Store Subscription</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <Building2 className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-white">Store Subscription</p>
                                    <p className="text-sm text-gray-500">Monthly billing</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-white">{billingInfo?.currency}{billingInfo?.monthlyTotal}</p>
                                <p className="text-sm text-gray-500">per month</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Payment History */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h3>
                    <div className="space-y-4">
                        {billingInfo?.paymentHistory && billingInfo.paymentHistory.length > 0 ? (
                            billingInfo.paymentHistory
                                .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
                                .map((payment: any, index: number) => (
                                <div key={payment.reference} className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <div>
                                            <p className="font-medium text-white">
                                                {new Date(payment.paidAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long' 
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                Paid on {new Date(payment.paidAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {payment.paymentMethod} • {payment.reference}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">
                                            {billingInfo?.currency}{payment.amount}
                                        </p>
                                        <p className={`text-xs ${
                                            payment.status === 'success' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {payment.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No payment history yet</p>
                                <p className="text-sm mt-1">Your payments will appear here once made</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}