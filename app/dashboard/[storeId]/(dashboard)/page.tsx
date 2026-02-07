import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";
import DashboardClient from "../_components/DashboardClient2";

interface DashboardPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const {storeId} = await params;
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    const data = {
        storeId
    };

    return <DashboardClient params={data} user={user} />;
}
