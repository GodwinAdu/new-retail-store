import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";
import DashboardClient from "../../_components/DashboardClient2";

interface DashboardPageProps {
    params: Promise<{
        storeId: string;
        branchId: string;
    }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const {storeId, branchId} = await params;
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    // If branchId is undefined, redirect to setup
    if (!branchId || branchId === 'undefined') {
        redirect(`/setup/${storeId}`);
    }

    const data = {
        storeId,
        branchId
    };

    return <DashboardClient params={data} user={user} />;
}