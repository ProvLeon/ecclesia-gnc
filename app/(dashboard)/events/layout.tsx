import { protectPage } from '@/lib/auth/proxy'

export default async function EventsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await protectPage('events:create')

    return <>{children}</>
}
