// Doctor dashboard for monitoring employee wellness alerts
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';

interface DoctorAlert {
  id: string;
  userId: string;
  userName?: string;
  type: string;
  riskLevel: string;
  confidence: number;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'resolved';
}

interface WellnessHistory {
  id: string;
  userId: string;
  userName?: string;
  events: Array<{
    type: string;
    riskLevel: string;
    timestamp: number;
    message: string;
  }>;
}

export function DoctorDashboard() {
  const [alerts, setAlerts] = useState<DoctorAlert[]>([]);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessHistory[]>([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    employeesAtRisk: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    // Listen for doctor alerts in real-time
    const alertsQuery = query(
      collection(db, 'doctor_alerts'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DoctorAlert[];
      setAlerts(alertsData);

      // Update stats
      const totalAlerts = alertsData.length;
      const criticalAlerts = alertsData.filter(a => a.riskLevel === 'critical').length;
      const employeesAtRisk = new Set(alertsData.map(a => a.userId)).size;
      
      setStats({
        totalAlerts,
        criticalAlerts,
        employeesAtRisk,
        avgResponseTime: 15 // Mock data
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch wellness history for employees
    const wellnessQuery = query(
      collection(db, 'wellness_events'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(wellnessQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Group events by userId
      const groupedByUser = eventsData.reduce((acc: Record<string, WellnessHistory>, event: any) => {
        if (!acc[event.userId]) {
          acc[event.userId] = {
            id: event.userId,
            userId: event.userId,
            userName: `Employee ${event.userId.slice(-4)}`, // Mock name
            events: []
          };
        }
        acc[event.userId].events.push({
          type: event.type,
          riskLevel: event.riskLevel,
          timestamp: event.timestamp,
          message: event.message
        });
        return acc;
      }, {} as Record<string, WellnessHistory>);

      setWellnessHistory(Object.values(groupedByUser));
    });

    return () => unsubscribe();
  }, []);

  const handleAlertAction = async (alertId: string, action: 'reviewed' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'doctor_alerts', alertId), {
        status: action,
        reviewedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Employees at Risk</p>
                <p className="text-2xl font-bold">{stats.employeesAtRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Wellness History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Employee Wellness Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active alerts
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRiskColor(alert.riskLevel)}>
                            {alert.riskLevel.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-medium">Employee {alert.userId.slice(-4)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {alert.type === 'critical_fatigue' 
                            ? 'Critical fatigue pattern detected - immediate attention required'
                            : 'Wellness concern detected'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {Math.round(alert.confidence * 100)}%
                        </p>
                      </div>

                      {alert.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAlertAction(alert.id, 'reviewed')}
                          >
                            Mark as Reviewed
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Employee Wellness History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {wellnessHistory.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{employee.userName}</h4>
                    <div className="space-y-2">
                      {employee.events.slice(0, 5).map((event, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{event.message}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className={getRiskColor(event.riskLevel)}>
                              {event.riskLevel}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Analytics dashboard with charts and trends would be implemented here.
                  This could include weekly/monthly wellness trends, department comparisons,
                  and predictive insights.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
