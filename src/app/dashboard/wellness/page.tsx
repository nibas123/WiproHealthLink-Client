"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { wellnessData } from "@/lib/data"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, TrendingUp, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const breakCompliancePercentage = (wellnessData.breakCompliance.taken / wellnessData.breakCompliance.recommended) * 100

export default function WellnessPage() {
  const { dailyActivity, breakCompliance, usageHeatmap } = wellnessData;
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];
  const yValues = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const xValues = ['9am', '10am', '11am', '1pm', '2pm', '4pm'];
  const parsedData = yValues.flatMap((day, i) =>
    xValues.map((time, j) => ({
      x: time,
      y: day,
      value: usageHeatmap[i][time],
    }))
  );
  const { toast } = useToast()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "This browser does not support desktop notifications.",
      });
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You will now receive break reminders.",
        });
        // Schedule a test notification
        setTimeout(() => {
          new Notification("Time for a break!", {
            body: "Look away from your screen for 20 seconds to rest your eyes.",
            icon: "/logo.svg", // Note: This file doesn't exist yet, but is a good practice
          });
        }, 5000); // 5 seconds for demo
      } else {
        toast({
          variant: "destructive",
          title: "Notifications Denied",
          description: "You will not receive break reminders. You can enable them in your browser settings.",
        });
      }
    });
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Digital Wellness
        </h1>
        <p className="text-muted-foreground">
          An overview of your daily computer usage and break patterns.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Keystrokes and mouse clicks per hour.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActivity.labels.map((label, i) => ({
                name: label,
                keystrokes: dailyActivity.datasets[0].data[i],
                mouseClicks: dailyActivity.datasets[1].data[i],
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="keystrokes" stroke={dailyActivity.datasets[0].color} name="Keystrokes" />
                <Line type="monotone" dataKey="mouseClicks" stroke={dailyActivity.datasets[1].color} name="Mouse Clicks"/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Break Compliance</CardTitle>
            <CardDescription>You've taken {breakCompliance.taken} of {breakCompliance.recommended} recommended breaks today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Progress value={breakCompliancePercentage} className="w-full" />
              <span className="text-xl font-bold">{Math.round(breakCompliancePercentage)}%</span>
            </div>
             {!notificationsEnabled && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1"/>
                        <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300">Enable Break Reminders</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Get desktop notifications when it's time to take a break.</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={requestNotificationPermission}>Enable</Button>
                </div>
            )}
            <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p>The 20-20-20 rule is a great way to avoid digital eye strain. Every 20 minutes, take a 20-second break to look at something 20 feet away.</p>
            </div>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp /> Weekly Usage Heatmap
          </CardTitle>
          <CardDescription>
            A visual overview of your peak activity hours during the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
             <BarChart data={parsedData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="category" dataKey="x" />
                <YAxis type="category" dataKey="y" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Activity Level">
                  {parsedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
