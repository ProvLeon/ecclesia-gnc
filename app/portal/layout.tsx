import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Member Portal | Ecclesia GNC',
    description: 'GNC AG Member Access Portal',
}

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className={cn(inter.className, "h-full bg-slate-50 dark:bg-slate-900")}>
                <div className="min-h-full flex flex-col">
                    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="font-bold text-primary">G</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">Ecclesia GNC</span>
                            </div>
                            <div className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Member Portal
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
                            &copy; {new Date().getFullYear()} Ecclesia GNC AG. All rights reserved.
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    )
}
