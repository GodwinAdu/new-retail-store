interface POSLayoutProps {
    children: React.ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
    return (
        <div className="w-full h-screen">
            {children}
        </div>
    );
}