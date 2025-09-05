
"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore"
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
import { Siren, CheckCircle, Loader2, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DoctorDashboardPage() {
  const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([])
  const [resolvedEmergencies, setResolvedEmergencies] = useState<Emergency[]>([])
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingResolved, setLoadingResolved] = useState(true)
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

    // Listener for active emergencies
    const qActive = query(collection(db, "emergencies"), where("status", "==", "active"));
    const unsubscribeActive = onSnapshot(qActive, (querySnapshot) => {
      const emergencies: Emergency[] = [];
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
        emergencies.push({ id: doc.id, ...doc.data() } as Emergency);
      });
      emergencies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActiveEmergencies(emergencies);
      setLoadingActive(false);
    });
    
    // Fetch resolved emergencies once
    const fetchResolvedEmergencies = async () => {
        setLoadingResolved(true);
        // Changed query to remove orderBy to avoid needing a composite index
        const qResolved = query(collection(db, "emergencies"), where("status", "==", "resolved"));
        const querySnapshot = await getDocs(qResolved);
        const emergencies: Emergency[] = [];
        querySnapshot.forEach((doc) => {
            emergencies.push({ id: doc.id, ...doc.data() } as Emergency);
        });
        // Sort on the client-side
        emergencies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setResolvedEmergencies(emergencies);
        setLoadingResolved(false);
    }

    fetchResolvedEmergencies();

    return () => unsubscribeActive();
  }, []);

  const resolveEmergency = async (id: string) => {
    const emergencyRef = doc(db, "emergencies", id);
    try {
      await updateDoc(emergencyRef, { status: "resolved" });
      toast({
        title: "Emergency Resolved",
        description: "The alert has been marked as resolved.",
      });
      // Refetch resolved list to show the newly resolved item
      const newActive = activeEmergencies.filter(e => e.id !== id);
      const newlyResolved = activeEmergencies.find(e => e.id === id);
      setActiveEmergencies(newActive);
      if (newlyResolved) {
        setResolvedEmergencies(prev => [{...newlyResolved, status: 'resolved'}, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
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
            Active and resolved emergency alerts from employees.
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
              {loadingActive ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : activeEmergencies.length > 0 ? (
                activeEmergencies.map((emergency) => (
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History/> Resolved Emergencies</CardTitle>
          <CardDescription>
            A log of previously attended emergencies.
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingResolved ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : resolvedEmergencies.length > 0 ? (
                resolvedEmergencies.map((emergency) => (
                  <TableRow key={emergency.id} className="text-muted-foreground">
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
                        <Badge variant="outline">{emergency.seatNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(emergency.timestamp), { addSuffix: true })}
                    </TableCell>
                     <TableCell>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-600/80">
                        <CheckCircle className="mr-1 h-3 w-3"/>
                        Resolved
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No resolved emergencies found.
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
