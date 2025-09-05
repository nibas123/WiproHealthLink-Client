
"use client"

import { useState } from "react"
import { AlertTriangle, Wifi, MapPin, Building, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleEmergency = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "emergencies"), {
        userId: userProfile.uid,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        bayName: userProfile.bayName,
        seatNumber: userProfile.seatNumber,
        wifiName: userProfile.wifiName,
        timestamp: new Date().toISOString(),
        status: 'active',
      });
      toast({
        title: "✅ Emergency Alert Sent",
        description: "The on-duty doctor and IT team have been notified.",
      });
    } catch (error) {
        console.error("Error creating emergency:", error)
        toast({
            variant: "destructive",
            title: "Failed to send alert",
            description: "Please try again.",
        })
    } finally {
        setLoading(false)
    }
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-6">
       <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {userProfile.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                This is your employee dashboard.
                </p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">EMERGENCY</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will immediately notify the on-duty medical and IT staff with your location details. Use this only in a genuine emergency.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEmergency} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Alert Now
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Your Location Details</CardTitle>
                <CardDescription>
                    These details will be sent to the response team in an emergency.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Building className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="text-muted-foreground">Bay Name</p>
                            <p className="font-semibold">{userProfile.bayName || "Not set"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <MapPin className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="text-muted-foreground">Seat Number</p>
                            <p className="font-semibold">{userProfile.seatNumber || "Not set"}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Wifi className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="text-muted-foreground">Wi-Fi Name</p>
                            <p className="font-semibold">{userProfile.wifiName || "Not set"}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
