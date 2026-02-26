import { currentUser } from "@/lib/helpers/current-user";
import { redirect } from "next/navigation";
import StockTakeClient from "@/components/StockTakeClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default async function StockTakePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.MANAGE_INVENTORY]}>
      <StockTakeClient storeId={storeId} userId={user._id} />
    </ProtectedRoute>
  );
}
