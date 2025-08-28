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
import { activityLogs } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"

function getActionVariant(action: string) {
    switch (action) {
        case 'Emergency Alert':
            return 'destructive'
        case 'Profile Update':
            return 'default'
        case 'Viewed Profile':
            return 'secondary'
        case 'Access Granted':
            return 'outline'
        default:
            return 'secondary'
    }
}

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
            Activity Log
        </h1>
        <p className="text-muted-foreground">
            An audit trail of all activities related to your profile.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
