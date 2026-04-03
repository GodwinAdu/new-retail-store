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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20">
                <div className="p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <a href={`/dashboard/${storeId}`}>
                                    <button className="text-gray-600 hover:text-gray-900 text-sm flex items-center mb-2">
                                        ← Back to Dashboard
                                    </button>
                                </a>
                                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                                <p className="text-gray-500 mt-1">Manage your store and account settings</p>
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