
'use client';

import { TrendingUp, Computer, Coffee } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell
} from 'recharts';
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const weeklyData = [
  { day: 'Mon', screenTime: 6.5, breaks: 5 },
  { day: 'Tue', screenTime: 7, breaks: 6 },
  { day: 'Wed', screenTime: 8, breaks: 4 },
  { day: 'Thu', screenTime: 5.5, breaks: 7 },
  { day: 'Fri', screenTime: 6, breaks: 5 },
  { day: 'Sat', screenTime: 1, breaks: 2 },
  { day: 'Sun', screenTime: 0.5, breaks: 1 },
];

const complianceData = [
    { name: 'Compliant', value: 85, color: 'hsl(var(--chart-1))' },
    { name: 'Non-compliant', value: 15, color: 'hsl(var(--destructive))' },
];

export default function WellnessPage() {
  const weeklyAverage = weeklyData.reduce((acc, day) => acc + day.screenTime, 0) / 5; // Weekday average

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Digital Wellness
          </h1>
          <p className="text-muted-foreground">
            Track your screen time and break compliance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Screen Time Goal
            </CardTitle>
             <Badge variant="outline">Good</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5 / 8 hours</div>
            <p className="text-xs text-muted-foreground">
              -18% from yesterday
            </p>
            <Progress value={81.25} className="mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Break Compliance
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
             <Progress value={85} className="mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Average
            </CardTitle>
            <Computer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyAverage.toFixed(1)} hours/day</div>
            <p className="text-xs text-muted-foreground">
              Based on your weekday activity
            </p>
             <div className="h-[22px] mt-4"/>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Overview</CardTitle>
            <CardDescription>
              Screen time vs. breaks taken this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar dataKey="screenTime" fill="hsl(var(--chart-1))" name="Screen Time (hrs)" />
                <Bar dataKey="breaks" fill="hsl(var(--chart-2))" name="Breaks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Break Policy Compliance</CardTitle>
             <CardDescription>
              Percentage of scheduled breaks taken vs. missed.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                    >
                        {complianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                    }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
