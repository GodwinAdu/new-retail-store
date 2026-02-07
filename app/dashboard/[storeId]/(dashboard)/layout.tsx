"use client";

import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import { useParams } from "next/navigation";

interface DashboardSubLayoutProps {
    children: React.ReactNode;
}

export default function DashboardSubLayout({ children }: DashboardSubLayoutProps) {
    const params = useParams();
    const storeId = params.storeId as string;

    return (
        <SettingsProvider storeId={storeId}>
            <div className="w-full">
                {children}
            </div>
        </SettingsProvider>
    );
}
