import { getStaffMembers, getStaffStats } from "@/lib/actions/staff.actions";
import { getCurrentUser } from "@/lib/utils/auth";
import StaffPageClient from "./StaffPageClient";

interface StaffPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
    const { storeId } = await params;

    const [staff, stats, user] = await Promise.all([
        getStaffMembers(storeId),
        getStaffStats(storeId),
        getCurrentUser()
    ]);

    return (
        <StaffPageClient 
            storeId={storeId} 
            staff={staff} 
            stats={stats}
            user={user}
        />
    );
}