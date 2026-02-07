import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";
import SocialMediaClient from "@/components/SocialMediaClient";

interface MarketingPageProps {
    params: Promise<{
        storeId: string;
        branchId: string;
    }>;
}

export default async function MarketingPage({ params }: MarketingPageProps) {
    const { storeId, branchId } = await params;
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return <SocialMediaClient storeId={storeId} branchId={branchId} />;
}