interface DashboardSubLayoutProps {
    children: React.ReactNode;
}

export default function DashboardSubLayout({ children }: DashboardSubLayoutProps) {
    return (
        <div className="w-full">
            {children}
        </div>
    );
}