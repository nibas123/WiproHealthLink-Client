"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalState } from "@/hooks/use-global-state"
import { useRouter } from "next/navigation"
import { User } from "@/lib/types"

export default function LoginPage() {
  const [isDoctor, setIsDoctor] = React.useState(false)
  const { users, setCurrentUser } = useGlobalState()
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const router = useRouter()

  const handleLogin = () => {
    if (selectedUser || isDoctor) {
      if(isDoctor) {
         router.push("/admin/dashboard")
      } else if (selectedUser) {
        setCurrentUser(selectedUser)
        router.push("/dashboard")
      }
    }
  }

  const handleUserChange = (userId: string) => {
      const user = users.find(u => u.id === userId) || null
      setSelectedUser(user)
  }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">Login to HealthLink</h1>
            <p className="text-balance text-muted-foreground">
              Select a user to access your dashboard.
            </p>
          </div>
          <div className="grid gap-4">
             <div className="grid gap-2">
               <Label htmlFor="user-select">Select Employee</Label>
                <Select onValueChange={handleUserChange} disabled={isDoctor}>
                    <SelectTrigger id="user-select">
                        <SelectValue placeholder="Select an employee to log in" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="role-switch" className="flex flex-col gap-0.5">
                <span className="font-medium">Login as Doctor</span>
                <span className="text-xs text-muted-foreground">
                  See the admin dashboard
                </span>
              </Label>
              <Switch
                id="role-switch"
                checked={isDoctor}
                onCheckedChange={setIsDoctor}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={!selectedUser && !isDoctor}>
                Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Wipro SSO
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Contact Admin
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center p-12 flex-col">
        <div className="max-w-md text-center">
          <Logo className="h-24 w-24 mx-auto text-primary mb-6" />
          <h2 className="text-4xl font-headline font-bold text-primary">
            HealthLink by Wipro
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your health, secured and connected. Instant access to medical
            history and emergency alerts for a safer workplace.
          </p>
        </div>
      </div>
    </div>
  )
}
