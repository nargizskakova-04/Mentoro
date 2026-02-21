import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '280px' }}>
                <Header />
                <main style={{ padding: '20px 40px' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
