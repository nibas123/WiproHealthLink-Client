
"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Timer, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification as NotificationType } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export default function MockAiSignalsPage() {
  const { toast } = useToast();
  const { user, userProfile, setUserProfile } = useAuth();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [intervalDuration, setIntervalDuration] = useState(30);

  const [screenTime, setScreenTime] = useState(userProfile?.wellnessData?.screenTimeCompliance || 81);
  const [breakCompliance, setBreakCompliance] = useState(userProfile?.wellnessData?.breakCompliance || 85);

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

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notificationData = change.doc.data() as NotificationType;
          showBrowserNotification(notificationData.message);
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
  
  const handleWellnessDataChange = useCallback(async (newData: { screenTimeCompliance?: number; breakCompliance?: number }) => {
    if (!userProfile) return;
    try {
        const userDocRef = doc(db, 'users', userProfile.uid);
        const updatedWellnessData = {
            ...userProfile.wellnessData,
            screenTimeCompliance: newData.screenTimeCompliance ?? userProfile.wellnessData?.screenTimeCompliance ?? 81,
            breakCompliance: newData.breakCompliance ?? userProfile.wellnessData?.breakCompliance ?? 85,
        };
        await updateDoc(userDocRef, { wellnessData: updatedWellnessData });
        setUserProfile(prev => prev ? { ...prev, wellnessData: updatedWellnessData } : null);
    } catch (error) {
        console.error("Error updating wellness data:", error);
        toast({ variant: 'destructive', title: "Failed to update wellness data" });
    }
}, [userProfile, setUserProfile, toast]);


  return (
    <div className="grid gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Mock AI Signals</h1>
            <p className="text-muted-foreground">
                Use this page to simulate AI-driven events for demos.
            </p>
        </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
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
                A notification will be sent every {intervalDuration} seconds.
                </p>
            )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit /> Simulate AI Wellness Insights</CardTitle>
                <CardDescription>
                    Manipulate the Digital Wellness dashboard data in real-time to simulate an AI providing live analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                <div className="space-y-3">
                    <div className="flex justify-between">
                       <Label>Screen Time Compliance</Label>
                       <span className="text-sm font-medium">{screenTime.toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={[screenTime]}
                        onValueChange={(value) => {
                            setScreenTime(value[0]);
                            handleWellnessDataChange({ screenTimeCompliance: value[0] });
                        }}
                        max={100}
                        step={1}
                    />
                </div>
                 <div className="space-y-3">
                    <div className="flex justify-between">
                       <Label>Break Compliance</Label>
                       <span className="text-sm font-medium">{breakCompliance.toFixed(0)}%</span>
                    </div>
                     <Slider
                        value={[breakCompliance]}
                        onValueChange={(value) => {
                            setBreakCompliance(value[0]);
                            handleWellnessDataChange({ breakCompliance: value[0] });
                        }}
                        max={100}
                        step={1}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <p className="text-sm text-center text-muted-foreground">
                    Changes here are reflected instantly on the Wellness page.
                </p>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
