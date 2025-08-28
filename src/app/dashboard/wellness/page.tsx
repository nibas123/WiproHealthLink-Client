
"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Heatmap, ZAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { wellnessData } from "@/lib/data"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, TrendingUp } from "lucide-react"

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
