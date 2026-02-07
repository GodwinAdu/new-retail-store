import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import SubscriptionBlocker from "@/components/SubscriptionBlocker";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: Promise<{ storeId: string; branchId: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const { storeId, branchId } = await params;
    return (
        <SubscriptionBlocker storeId={storeId}>
            <SettingsProvider branchId={branchId}>
                <div className="w-full">
                    {children}
                </div>
            </SettingsProvider>
        </SubscriptionBlocker>
    );
}