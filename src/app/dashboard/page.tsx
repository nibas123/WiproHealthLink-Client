
"use client"

import { useState } from "react"
import { AlertTriangle, Wifi, MapPin, Building, Loader2, HeartPulse, Pill, ShieldAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { collection, addDoc } from "firebase/firestore"
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const severityVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  severe: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'default',
};

const conditionVariantMap: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  managed: 'secondary',
  active: 'outline',
};

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
        variant: "destructive",
        title: "🚨 Emergency Alert Sent 🚨",
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
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="grid gap-6">
       <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {userProfile.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                Here's a summary of your profile. Keep it up to date.
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
                    <AlertDialogAction onClick={handleEmergency} disabled={loading} className="bg-destructive hover:bg-destructive/90">
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/>Allergies</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/wellness-profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent>
                {userProfile.allergies && userProfile.allergies.length > 0 ? (
                    <ul className="space-y-3">
                        {userProfile.allergies.map((allergy, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="font-medium">{allergy.name}</span>
                                <Badge variant={severityVariantMap[allergy.severity.toLowerCase()] || 'default'}>{allergy.severity}</Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No allergies listed. Click 'Edit' to add them.</p>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Pill className="text-primary"/>Medications</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/wellness-profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent>
               {userProfile.medications && userProfile.medications.length > 0 ? (
                    <ul className="space-y-3">
                        {userProfile.medications.map((medication, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="font-medium">{medication.name}</span>
                                <span className="text-muted-foreground text-sm">{medication.dosage}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No medications listed. Click 'Edit' to add them.</p>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><HeartPulse className="text-green-600"/>Conditions</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/wellness-profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent>
               {userProfile.conditions && userProfile.conditions.length > 0 ? (
                    <ul className="space-y-3">
                        {userProfile.conditions.map((condition, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="font-medium">{condition.name}</span>
                                <Badge variant={conditionVariantMap[condition.status.toLowerCase()] || 'outline'}>{condition.status}</Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No conditions listed. Click 'Edit' to add them.</p>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Emergency Contacts</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/wellness-profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent>
                {userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0 ? (
                    <ul className="space-y-3">
                        {userProfile.emergencyContacts.map((contact, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="font-medium">{contact.name} <span className="text-sm text-muted-foreground">({contact.relationship})</span></span>
                                <span className="text-muted-foreground text-sm">{contact.phone}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No contacts listed. Click 'Edit' to add them.</p>
                )}
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
