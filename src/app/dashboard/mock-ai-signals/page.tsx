
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
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification as NotificationType } from "@/lib/types";

export default function MockAiSignalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [intervalDuration, setIntervalDuration] = useState(30); // Default 30 seconds

  const showBrowserNotification = useCallback((message = "Time for a break!") => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      console.error("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(message, {
        body: "It's time to step away from your screen for a few minutes.",
        icon: "/logo.svg",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }
  }, []);

  // Listen for real-time notifications from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notificationData = change.doc.data() as NotificationType;
          showBrowserNotification(notificationData.message);
          // Delete the notification doc after it's been processed
          deleteDoc(doc(db, "notifications", change.doc.id));
        }
      });
    });

    return () => unsubscribe();
  }, [user, showBrowserNotification]);


  const sendBreakNotification = useCallback(async () => {
      if (!user) {
          toast({ variant: "destructive", title: "You must be logged in" });
          return;
      }
      try {
          await addDoc(collection(db, "notifications"), {
              userId: user.uid,
              message: "Time for a break!",
              createdAt: serverTimestamp()
          });
          toast({ title: "Success", description: "Break notification sent to all your devices." });
      } catch (error) {
          console.error("Error sending notification:", error);
          toast({ variant: "destructive", title: "Failed to send notification" });
      }
  }, [user, toast]);


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

  
  useEffect(() => {
    if (isTimerRunning) {
      const id = setInterval(sendBreakNotification, intervalDuration * 1000);
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
  }, [isTimerRunning, intervalDuration, sendBreakNotification]);

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  return (
    <div className="grid gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Mock AI Signals</h1>
            <p className="text-muted-foreground">
                Use this page to simulate break reminder signals for demos across devices.
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
              onClick={sendBreakNotification}
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
              disabled={isTimerRunning}
            />
          </div>
          {isTimerRunning && (
            <p className="text-sm text-center text-muted-foreground">
              A notification will be sent to all your devices every {intervalDuration} seconds.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
