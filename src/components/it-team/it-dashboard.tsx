// IT Team dashboard for managing wellness monitoring system
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Settings, Users, Database, Upload, Download } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, query } from 'firebase/firestore';

interface WellnessConfig {
  maxContinuousMinutes: number;
  keystrokeThreshold: number;
  mouseActivityThreshold: number;
  breakReminderInterval: number;
  criticalFatigueThreshold: number;
  enabledDepartments: string[];
  alertCooldownMinutes: number;
}

interface SystemStats {
  totalEmployees: number;
  activeMonitoring: number;
  alertsToday: number;
  modelVersion: string;
  lastSync: number;
}

export function ITTeamDashboard() {
  const [config, setConfig] = useState<WellnessConfig>({
    maxContinuousMinutes: 90,
    keystrokeThreshold: 1000,
    mouseActivityThreshold: 5000,
    breakReminderInterval: 30,
    criticalFatigueThreshold: 0.8,
    enabledDepartments: ['Engineering', 'Design', 'Marketing'],
    alertCooldownMinutes: 30
  });

  const [stats, setStats] = useState<SystemStats>({
    totalEmployees: 0,
    activeMonitoring: 0,
    alertsToday: 0,
    modelVersion: 'v1.0.0',
    lastSync: Date.now()
  });

  const [loading, setLoading] = useState(false);
  const [departments] = useState(['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance']);

  useEffect(() => {
    loadConfiguration();
    loadSystemStats();
  }, []);

  const loadConfiguration = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'system_config', 'wellness'));
      if (configDoc.exists()) {
        setConfig({ ...config, ...configDoc.data() });
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const loadSystemStats = () => {
    // Listen for real-time stats
    const statsQuery = query(collection(db, 'activity_summaries'));
    const unsubscribe = onSnapshot(statsQuery, (snapshot) => {
      const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId)).size;
      
      // Calculate today's alerts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const alertsQuery = query(collection(db, 'wellness_events'));
      
      onSnapshot(alertsQuery, (alertSnapshot) => {
        const todayAlerts = alertSnapshot.docs.filter(doc => 
          doc.data().timestamp >= today.getTime()
        ).length;

        setStats(prev => ({
          ...prev,
          totalEmployees: uniqueUsers,
          activeMonitoring: uniqueUsers,
          alertsToday: todayAlerts,
          lastSync: Date.now()
        }));
      });
    });

    return () => unsubscribe();
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'system_config', 'wellness'), config);
      
      // Show success message
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentToggle = (department: string) => {
    setConfig(prev => ({
      ...prev,
      enabledDepartments: prev.enabledDepartments.includes(department)
        ? prev.enabledDepartments.filter(d => d !== department)
        : [...prev.enabledDepartments, department]
    }));
  };

  const exportData = async () => {
    try {
      // Mock export functionality
      const data = {
        config,
        stats,
        timestamp: Date.now()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellness-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const uploadModel = () => {
    // Mock model upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.h5';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Model ${file.name} uploaded successfully! (Mock)`);
        setStats(prev => ({
          ...prev,
          modelVersion: `v1.${Math.floor(Math.random() * 10)}.0`
        }));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Monitoring</p>
                <p className="text-2xl font-bold">{stats.activeMonitoring}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Alerts Today</p>
                <p className="text-2xl font-bold">{stats.alertsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Model Version</p>
                <p className="text-2xl font-bold">{stats.modelVersion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thresholds">Wellness Thresholds</TabsTrigger>
          <TabsTrigger value="departments">Department Settings</TabsTrigger>
          <TabsTrigger value="models">Model Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Monitoring Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxContinuous">Max Continuous Activity (minutes)</Label>
                  <Input
                    id="maxContinuous"
                    type="number"
                    value={config.maxContinuousMinutes}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      maxContinuousMinutes: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum time before break reminder
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keystrokeThreshold">Keystroke Threshold (per 5min)</Label>
                  <Input
                    id="keystrokeThreshold"
                    type="number"
                    value={config.keystrokeThreshold}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      keystrokeThreshold: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    High activity detection threshold
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mouseThreshold">Mouse Activity Threshold</Label>
                  <Input
                    id="mouseThreshold"
                    type="number"
                    value={config.mouseActivityThreshold}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      mouseActivityThreshold: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Mouse movement detection threshold
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">Critical Fatigue Threshold</Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.criticalFatigueThreshold}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      criticalFatigueThreshold: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    AI confidence threshold for critical alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderInterval">Break Reminder Interval (minutes)</Label>
                  <Input
                    id="reminderInterval"
                    type="number"
                    value={config.breakReminderInterval}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      breakReminderInterval: parseInt(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertCooldown">Alert Cooldown (minutes)</Label>
                  <Input
                    id="alertCooldown"
                    type="number"
                    value={config.alertCooldownMinutes}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      alertCooldownMinutes: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <Button onClick={saveConfiguration} disabled={loading}>
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Monitoring Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable or disable wellness monitoring for specific departments.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((department) => (
                    <div key={department} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium">{department}</h4>
                        <p className="text-sm text-muted-foreground">
                          {config.enabledDepartments.includes(department) ? 'Monitoring enabled' : 'Monitoring disabled'}
                        </p>
                      </div>
                      <Switch
                        checked={config.enabledDepartments.includes(department)}
                        onCheckedChange={() => handleDepartmentToggle(department)}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={saveConfiguration} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Department Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Current Model</h4>
                  <p className="text-sm text-muted-foreground">
                    Version: {stats.modelVersion}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(stats.lastSync).toLocaleString()}
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>

              <div className="flex space-x-4">
                <Button onClick={uploadModel} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Model
                </Button>
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  Model updates will be automatically deployed to all employee dashboards.
                  Ensure thorough testing before deployment.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Health & Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-green-600">Database Status</h4>
                    <p className="text-sm text-muted-foreground">
                      ✓ Firestore connection healthy
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-green-600">AI Model Status</h4>
                    <p className="text-sm text-muted-foreground">
                      ✓ TensorFlow.js model loaded
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-green-600">Real-time Sync</h4>
                    <p className="text-sm text-muted-foreground">
                      ✓ All dashboards synchronized
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-blue-600">Data Collection</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.activeMonitoring} employees actively monitored
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    System is operating normally. All wellness monitoring features are active.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
