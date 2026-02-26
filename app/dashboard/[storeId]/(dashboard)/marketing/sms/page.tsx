import { redirect } from 'next/navigation';
import SMSMarketingClient from '@/components/SMSMarketingClient';
import { getCurrentUser } from '@/lib/utils/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PERMISSIONS } from '@/lib/permissions';

export default async function SMSMarketingPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const { storeId } = await params;

  return (
    <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.MANAGE_MARKETING]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <SMSMarketingClient storeId={storeId} userId={user.id} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
