
"use client"

import { Logo } from "@/components/icons"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function ITTeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userProfile, loading } = useAuth()

  if (loading || !userProfile) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold">HealthLink (IT Team)</span>
                </a>
            </nav>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto flex-1 sm:flex-initial">
                    {/* Can add search here later */}
                </div>
                <UserNav user={userProfile} />
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
            {children}
        </main>
    </div>
  )
}
