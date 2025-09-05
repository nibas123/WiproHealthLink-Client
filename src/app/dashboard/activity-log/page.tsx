
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Activity } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Normal: 'default',
  Info: 'secondary',
  Warning: 'destructive',
};

// Define a type for the activity with a processed timestamp
type ProcessedActivity = Omit<Activity, 'timestamp'> & {
  timestamp: Date;
};


export default function ActivityLogPage() {
  const { user } = useAuth();
  const [allActivities, setAllActivities] = useState<ProcessedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const q = query(
            collection(db, 'activity_log'), 
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const activities = querySnapshot.docs.map(doc => {
            const data = doc.data() as Activity;
            // Convert Firestore Timestamp to JS Date
            const timestamp = (data.timestamp as unknown as Timestamp).toDate();
            return { ...data, id: doc.id, timestamp };
        });
        setAllActivities(activities);
      } catch (error) {
        console.error("Error fetching activities: ", error);
        // Handle error appropriately, e.g., show a toast
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);
  
  const filteredActivities = useMemo(() => {
    return allActivities.filter(activity => {
      const matchesDescription = activity.description.toLowerCase().includes(descriptionFilter.toLowerCase());
      const matchesType = typeFilter === 'all' || activity.type.toLowerCase() === typeFilter;
      return matchesDescription && matchesType;
    });
  }, [allActivities, descriptionFilter, typeFilter]);

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
            <Input 
              placeholder="Filter by description..." 
              className="max-w-sm"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="profileupdate">Profile Update</SelectItem>
                <SelectItem value="wellnessupdate">Wellness Update</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
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
              ))) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No activity found.
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
