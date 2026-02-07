import { protectPage } from '@/lib/auth/proxy'

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await protectPage('sms:send')

    return <>{children}</>
}
