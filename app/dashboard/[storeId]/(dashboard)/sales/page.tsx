import SalesClient from "./SalesClient";
import { getSales, getSaleStats } from "@/lib/actions/sale.actions";
import { getCurrentUser } from "@/lib/utils/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";

interface SalesPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function SalesPage({ params }: SalesPageProps) {
    const { storeId} = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const today = new Date();

    const [sales, stats] = await Promise.all([
        getSales(storeId, 50, oneMonthAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]),
        getSaleStats(storeId, oneMonthAgo.toISOString().split('T')[0], today.toISOString().split('T')[0])
    ]);

    return (
        <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_SALES]}>
            <SalesClient 
                storeId={storeId}
                initialSales={sales}
                initialStats={stats}
            />
        </ProtectedRoute>
    );
}