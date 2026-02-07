import { protectPage } from '@/lib/auth/proxy'

export default async function DepartmentsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await protectPage('members:view')

    return <>{children}</>
}
