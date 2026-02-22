import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Attendance History' };

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
