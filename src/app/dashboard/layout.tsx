
"use client"

import { Activity, LayoutDashboard, HeartPulse } from "lucide-react"
import { usePathname } from 'next/navigation'

import { Logo } from "@/components/icons"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Wellness', href: '/dashboard/wellness', icon: HeartPulse },
  { name: 'Activity Log', href: '/dashboard/activity-log', icon: Activity },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userProfile, loading } = useAuth()
  const pathname = usePathname()

  if (loading || !userProfile) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold">HealthLink</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                            ? "bg-muted text-primary"
                            : ""
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
        <div className="flex flex-1 flex-col">
             <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial">
                        {/* Can add search here later */}
                    </div>
                    <UserNav user={userProfile} />
                </div>
            </header>
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                {children}
            </main>
        </div>
    </div>
  )
}
