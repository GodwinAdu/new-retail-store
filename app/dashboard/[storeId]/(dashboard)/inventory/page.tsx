import InventoryClient from "@/components/InventoryClient";
import { getCurrentUser } from "@/lib/utils/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";

interface InventoryPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_INVENTORY]}>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <InventoryClient storeId={storeId}  user={user} />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}