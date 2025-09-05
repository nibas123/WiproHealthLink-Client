
"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MockAiSignalsPage() {
  const { toast } = useToast();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [intervalDuration, setIntervalDuration] = useState(30); // Default 30 seconds

  // Request notification permission on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Browser notifications are disabled. You won't receive break reminders.",
          });
        }
      });
    }
  }, [toast]);

  const showBrowserNotification = useCallback(() => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      console.error("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Time for a break!", {
        body: "It's time to step away from your screen for a few minutes.",
        icon: "/logo.svg", // Optional: you can add an icon
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Time for a break!");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      const id = setInterval(showBrowserNotification, intervalDuration * 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimerRunning, intervalDuration, showBrowserNotification]);

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  return (
    <div className="grid gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Mock AI Signals</h1>
            <p className="text-muted-foreground">
                Use this page to simulate break reminder signals for demos.
            </p>
        </div>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Break Reminders</CardTitle>
          <CardDescription>
            Manually trigger or automate break notifications using browser alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={showBrowserNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="mr-2" /> Send Manual Alert
            </Button>
            <Button onClick={toggleTimer} className="w-full">
              <Timer className="mr-2" />{" "}
              {isTimerRunning ? "Stop Timer" : "Start Timer"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timer-config">Timer Interval (seconds)</Label>
            <Input
              id="timer-config"
              type="number"
              value={intervalDuration}
              onChange={(e) => setIntervalDuration(Number(e.target.value))}
              placeholder="Set interval in seconds"
            />
          </div>
          {isTimerRunning && (
            <p className="text-sm text-center text-muted-foreground">
              You will be notified every {intervalDuration} seconds to take a break.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
