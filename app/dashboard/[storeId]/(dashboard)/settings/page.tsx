import { Settings, Store, MapPin, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/helpers/current-user";
import { getStoreSettings } from "@/lib/actions/settings.actions";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

interface SettingsPageProps {
    params: Promise<{
        storeId: string;
    }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const { storeId } = await params;
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const [store] = await Promise.all([
        getStoreSettings(storeId),
    ]);

    return (
        <ProtectedRoute user={user} requiredPermissions={[PERMISSIONS.VIEW_SETTINGS]}>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Settings</h1>
                                <p className="text-gray-300 mt-1">Manage your store, branch, and account settings</p>
                            </div>
                        </div>

                        <SettingsClient
                            user={user}
                            store={store}
                            storeId={storeId}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}