import { getStaffMembers, getStaffStats } from "@/lib/actions/staff.actions";
import { getCurrentUser } from "@/lib/utils/auth";
import StaffPageClient from "./StaffPageClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";

interface StaffPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const [staff, stats] = await Promise.all([
        getStaffMembers(storeId),
        getStaffStats(storeId)
    ]);

    return (
        <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_STAFF]}>
            <StaffPageClient 
                storeId={storeId} 
                staff={staff} 
                stats={stats}
                user={user}
            />
        </ProtectedRoute>
    );
}