import CustomersClient from "./CustomersClient";
import { getCustomers, getCustomerStats } from "@/lib/actions/customer.actions";

interface CustomersPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function CustomersPage({ params }: CustomersPageProps) {
    const { storeId } = await params;

    const [customers, stats] = await Promise.all([
        getCustomers(storeId),
        getCustomerStats(storeId)
    ]);

    return (
        <CustomersClient 
            storeId={storeId}
            initialCustomers={customers}
            initialStats={stats}
        />
    );
}