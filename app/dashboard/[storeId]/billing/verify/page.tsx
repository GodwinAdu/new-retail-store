import { redirect } from "next/navigation";
import { verifyPayment } from "@/lib/actions/billing.actions";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VerifyPageProps {
    params: Promise<{ storeId: string }>;
    searchParams: Promise<{ reference?: string }>;
}

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
    const { storeId } = await params;
    const { reference } = await searchParams;

    if (!reference) {
        redirect(`/dashboard/${storeId}/billing`);
    }

    let verification;
    let success = false;

    try {
        verification = await verifyPayment(reference);
        success = verification.status && verification.data.status === 'success';
    } catch (error) {
        console.error("Verification error:", error);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
                    {success ? (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                            <p className="text-gray-300 mb-6">
                                Your subscription has been renewed successfully.
                            </p>
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                                <p className="text-green-300 text-sm">
                                    Amount: GH₵{verification?.data?.amount / 100}
                                </p>
                                <p className="text-green-300 text-sm">
                                    Reference: {reference}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
                            <p className="text-gray-300 mb-6">
                                There was an issue processing your payment. Please try again.
                            </p>
                        </>
                    )}
                    
                    <Link href={`/dashboard/${storeId}/billing`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Back to Billing
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}