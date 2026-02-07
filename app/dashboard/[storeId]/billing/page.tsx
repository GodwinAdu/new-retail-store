import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";
import BillingClient from "./_components/BillingClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

interface BillingPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
    try {
        const { storeId } = await params;
        const user = await currentUser();
        
        if (!user) {
            redirect("/sign-in");
        }

        return (
            <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_BILLING]}>
                <BillingClient user={user} />
            </ProtectedRoute>
        );
    } catch (error) {
        console.error("Billing error:", error);
        redirect("/sign-in");
    }
}