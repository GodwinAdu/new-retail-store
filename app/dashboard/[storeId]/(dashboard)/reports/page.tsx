import ReportsClient from "./ReportsClient";
import { getReportStats, getSalesChart, getCategoryStats } from "@/lib/actions/report.actions";

interface ReportsPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
    const { storeId } = await params;

    const [stats, salesChart, categoryStats] = await Promise.all([
        getReportStats(storeId),
        getSalesChart(storeId),
        getCategoryStats(storeId)
    ]);

    return (
        <ReportsClient 
            storeId={storeId}
            initialStats={stats}
            initialSalesChart={salesChart}
            initialCategoryStats={categoryStats}
        />
    );
}