
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Placeholder data for the activity log
const activities = [
  { id: 1, type: 'Login', description: 'Successful login from new device', timestamp: new Date(2023, 6, 25, 9, 5, 0), status: 'Normal' },
  { id: 2, type: 'Break', description: 'Started a 15-minute break', timestamp: new Date(2023, 6, 25, 10, 30, 0), status: 'Normal' },
  { id: 3, type: 'Break', description: 'Ended break', timestamp: new Date(2023, 6, 25, 10, 45, 0), status: 'Normal' },
  { id: 4, type: 'System', description: 'Compliance score updated to 85%', timestamp: new Date(2023, 6, 25, 12, 0, 0), status: 'Info' },
  { id: 5, type: 'Break', description: 'Missed scheduled break', timestamp: new Date(2023, 6, 25, 14, 0, 0), status: 'Warning' },
  { id: 6, type: 'Login', description: 'Successful login', timestamp: new Date(2023, 6, 24, 9, 2, 0), status: 'Normal' },
  { id: 7, type: 'Logout', description: 'User logged out', timestamp: new Date(2023, 6, 24, 17, 30, 0), status: 'Normal' },
];


const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Normal: 'default',
  Info: 'secondary',
  Warning: 'destructive',
};

export default function ActivityLogPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            A detailed log of your account and wellness activities.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Filter and review your activity history.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Filter by description..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Apply Filters</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant="outline">{activity.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  <TableCell>
                    {format(activity.timestamp, 'PPpp')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[activity.status] || 'default'}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
