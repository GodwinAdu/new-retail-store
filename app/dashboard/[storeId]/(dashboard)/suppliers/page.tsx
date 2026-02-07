import { redirect } from "next/navigation";
import { currentUser } from "@/lib/helpers/current-user";
import SuppliersClient from "./SuppliersClient";

interface SuppliersPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function SuppliersPage({ params }: SuppliersPageProps) {
    const { storeId } = await params;
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return <SuppliersClient storeId={storeId} />;
}