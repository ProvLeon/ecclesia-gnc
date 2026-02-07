import { protectPage } from '@/lib/auth/proxy'

export default async function AttendanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await protectPage('attendance:view')

    return <>{children}</>
}
