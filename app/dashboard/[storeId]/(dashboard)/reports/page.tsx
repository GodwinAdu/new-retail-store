import ReportsClient from "./ReportsClient";
import { getReportStats, getSalesChart, getCategoryStats } from "@/lib/actions/report.actions";
import { getCurrentUser } from "@/lib/utils/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";

interface ReportsPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const [stats, salesChart, categoryStats] = await Promise.all([
        getReportStats(storeId),
        getSalesChart(storeId),
        getCategoryStats(storeId)
    ]);

    return (
        <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
            <ReportsClient 
                storeId={storeId}
                initialStats={stats}
                initialSalesChart={salesChart}
                initialCategoryStats={categoryStats}
            />
        </ProtectedRoute>
    );
}