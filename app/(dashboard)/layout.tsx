import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="lg:pl-72">
                <Header user={user} />
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
