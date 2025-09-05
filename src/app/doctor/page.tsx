
"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Emergency } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Siren, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DoctorDashboardPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const showBrowserNotification = (message: string, body: string) => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      console.error("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(message, { body, icon: "/logo.svg" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(message, { body, icon: "/logo.svg" });
        }
      });
    }
  };

  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== 'undefined' && "Notification" in window) {
      Notification.requestPermission();
    }

    const q = query(collection(db, "emergencies"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activeEmergencies: Emergency[] = [];
      querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
              const newEmergency = change.doc.data() as Emergency;
              showBrowserNotification(
                  `🚨 New Emergency: ${newEmergency.userName}`, 
                  `Location: ${newEmergency.bayName}, Seat: ${newEmergency.seatNumber}`
              );
          }
      });
      querySnapshot.forEach((doc) => {
        activeEmergencies.push({ id: doc.id, ...doc.data() } as Emergency);
      });
      // Sort by timestamp descending
      activeEmergencies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEmergencies(activeEmergencies);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resolveEmergency = async (id: string) => {
    const emergencyRef = doc(db, "emergencies", id);
    try {
      await updateDoc(emergencyRef, { status: "resolved" });
      toast({
        title: "Emergency Resolved",
        description: "The alert has been marked as resolved.",
      });
    } catch (error) {
        console.error("Error resolving emergency: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not resolve the emergency. Please try again.",
        })
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Siren className="text-destructive"/> Doctor Dashboard
        </h1>
        <p className="text-muted-foreground">
            Active emergency alerts from employees.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Emergencies</CardTitle>
          <CardDescription>
            These alerts require immediate attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Bay Name</TableHead>
                <TableHead>Seat Number</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : emergencies.length > 0 ? (
                emergencies.map((emergency) => (
                  <TableRow key={emergency.id} className="font-medium">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emergency.userAvatar} alt={emergency.userName} />
                          <AvatarFallback>{emergency.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{emergency.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{emergency.bayName}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{emergency.seatNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(emergency.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => resolveEmergency(emergency.id)} className="gap-2">
                        <CheckCircle />
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No active emergencies.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
