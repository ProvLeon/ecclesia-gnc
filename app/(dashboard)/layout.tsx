import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth/proxy'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserWithRole()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar userRole={user.role} />
      <div className="lg:pl-72 flex flex-col">
        <Header user={user} />
        <main
          id="main-content"
          className="py-6 px-4 sm:px-6 lg:px-8 flex-1"
          role="main"
        >
          {children}
        </main>
        <footer
          role="contentinfo"
          className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4 text-sm text-slate-500 dark:text-slate-400"
        >
          <p>&copy; 2025 Ecclesia GNC. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
