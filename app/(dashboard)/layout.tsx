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
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex h-full">
        <Sidebar userRole={user.role} />
        <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
          <Header user={user} />
          <main
            id="main-content"
            className="flex-1 py-6 px-4 sm:px-6 lg:px-8"
            role="main"
          >
            {children}
          </main>
          <footer
            role="contentinfo"
            className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4 text-sm text-slate-500 dark:text-slate-400 backdrop-blur-sm"
          >
            <p>&copy; 2025 Ecclesia GNC. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
