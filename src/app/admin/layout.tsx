"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Siren } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { UserNav } from "@/components/user-nav"

const menuItems = [
    { href: "/admin/dashboard", label: "Alerts Dashboard", icon: Siren },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const adminUser = {name: "Dr. Smith", email: "dr.smith@wipro.com", avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'}

  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold font-headline">HealthLink (Admin)</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              <h1 className="font-semibold text-lg">Admin Portal</h1>
            </div>
            <UserNav user={adminUser}/>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  )
}
