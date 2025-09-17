// Wellness monitoring dashboard component for employees
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Eye, Heart, Brain, Clock, AlertTriangle } from 'lucide-react';
import { useActivityMonitor } from '../../hooks/use-activity-monitor';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface WellnessEvent {
  id: string;
  type: string;
  riskLevel: string;
  confidence: number;
  timestamp: number;
  message: string;
}

interface WellnessDashboardProps {
  userId: string;
}

export function WellnessDashboard({ userId }: WellnessDashboardProps) {
  const { wellnessState, isMonitoring } = useActivityMonitor(userId);
  const [recentEvents, setRecentEvents] = useState<WellnessEvent[]>([]);
  const [dailyBreaks, setDailyBreaks] = useState(0);
  const [screenTimeToday, setScreenTimeToday] = useState(0);

  useEffect(() => {
    // Listen for wellness events in real-time
    const eventsQuery = query(
      collection(db, 'wellness_events'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WellnessEvent[];
      setRecentEvents(events);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    // Calculate daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activityQuery = query(
      collection(db, 'activity_summaries'),
      where('userId', '==', userId),
      where('timestamp', '>=', today.getTime()),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(activityQuery, (snapshot) => {
      let totalMinutes = 0;
      let breakCount = 0;
      let lastActivityTime = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const duration = (data.endTime - data.startTime) / (1000 * 60); // minutes
        totalMinutes += duration;

        // Count breaks (gaps > 15 minutes between activities)
        if (lastActivityTime && data.startTime - lastActivityTime > 15 * 60 * 1000) {
          breakCount++;
        }
        lastActivityTime = data.endTime;
      });

      setScreenTimeToday(Math.round(totalMinutes));
      setDailyBreaks(breakCount);
    });

    return () => unsubscribe();
  }, [userId]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'Critical';
      case 'high': return 'High Risk';
      case 'medium': return 'Moderate';
      default: return 'Good';
    }
  };

  const takeBreak = async () => {
    // Log manual break
    await fetch('/api/wellness/break', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, timestamp: Date.now() })
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Wellness Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Wellness Monitor
            {isMonitoring && <Badge variant="outline" className="ml-2">Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Status</span>
            <Badge className={getRiskColor(wellnessState.riskLevel)}>
              {getRiskText(wellnessState.riskLevel)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Wellness Score</span>
              <span>{Math.round((1 - wellnessState.confidence) * 100)}%</span>
            </div>
            <Progress value={(1 - wellnessState.confidence) * 100} className="h-2" />
          </div>

          {wellnessState.isOverworked && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Take a break! Prolonged activity detected. Consider stepping away from your screen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Screen Time Today</p>
                <p className="text-2xl font-bold">{screenTimeToday}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Breaks Taken</p>
                <p className="text-2xl font-bold">{dailyBreaks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Eye Rest Goal</p>
                <p className="text-2xl font-bold">{Math.min(dailyBreaks, 8)}/8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={takeBreak} variant="outline">
              Take Break Now
            </Button>
            <Button variant="outline">
              Eye Exercises
            </Button>
            <Button variant="outline">
              Posture Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Wellness Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Wellness Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent wellness events</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={getRiskColor(event.riskLevel)}>
                    {getRiskText(event.riskLevel)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
