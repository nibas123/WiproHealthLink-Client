"use client"

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
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Siren, CheckCircle, User, MapPin, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGlobalState } from "@/hooks/use-global-state"

export default function AdminDashboardPage() {
    const { alerts, setAlerts } = useGlobalState()
    const { toast } = useToast()

    const acknowledgeAlert = (id: string) => {
        setAlerts(alerts.map(alert => alert.id === id ? {...alert, status: 'Acknowledged'} : alert))
        const alert = alerts.find(a => a.id === id)
        toast({
            title: "Alert Acknowledged",
            description: `You have acknowledged the alert for ${alert?.employeeName}.`,
        })
    }

    const pendingAlerts = alerts.filter(a => a.status === 'Pending');
    const acknowledgedAlerts = alerts.filter(a => a.status === 'Acknowledged');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Siren className="text-destructive"/> Emergency Alert Dashboard
        </h1>
        <p className="text-muted-foreground">
            Active and acknowledged employee emergency alerts.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Alerts</CardTitle>
          <CardDescription>These alerts require immediate attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {pendingAlerts.length > 0 ? pendingAlerts.map(alert => (
                <Card key={alert.id} className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User /> {alert.employeeName}
                            </div>
                            <Badge variant="destructive">{alert.status}</Badge>
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1 pt-2">
                           <div className="flex items-center gap-2 text-sm">
                             <MapPin className="w-4 h-4"/> {alert.location}
                           </div>
                           <div className="flex items-center gap-2 text-sm">
                             <Clock className="w-4 h-4"/> {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                           </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="p-3 text-sm bg-background rounded-md border text-foreground">{alert.summary}</p>
                        <Button onClick={() => acknowledgeAlert(alert.id)} className="gap-2">
                            <CheckCircle /> Acknowledge
                        </Button>
                    </CardContent>
                </Card>
            )) : (
                <p className="text-muted-foreground text-center py-8">No pending alerts.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Acknowledged Alerts</CardTitle>
          <CardDescription>A log of past alerts that have been handled.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acknowledgedAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.employeeName}</TableCell>
                  <TableCell>{alert.location}</TableCell>
                  <TableCell className="text-muted-foreground">
                     {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{alert.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
               {acknowledgedAlerts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No acknowledged alerts yet.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
