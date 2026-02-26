import { currentUser } from "@/lib/helpers/current-user";
import { redirect } from "next/navigation";
import PurchaseOrdersClient from "@/components/PurchaseOrdersClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default async function PurchaseOrdersPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.MANAGE_INVENTORY]}>
      <PurchaseOrdersClient storeId={storeId} userId={user._id} />
    </ProtectedRoute>
  );
}
