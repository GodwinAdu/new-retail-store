import { currentUser } from "@/lib/helpers/current-user";
import { redirect } from "next/navigation";
import InventoryReportsClient from "@/components/InventoryReportsClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default async function InventoryReportsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_INVENTORY]}>
      <InventoryReportsClient storeId={storeId} />
    </ProtectedRoute>
  );
}
