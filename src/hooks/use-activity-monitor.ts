// React hook for monitoring keyboard and mouse activity
// Aggregates anonymized intervals and syncs summary events to Firestore
import { useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useWellnessAI } from './use-wellness-ai';

interface ActivitySummary {
  keystrokeCount: number;
  mouseMoveCount: number;
  startTime: number;
  endTime: number;
}

export function useActivityMonitor(userId: string) {
  const keystrokeCount = useRef(0);
  const mouseMoveCount = useRef(0);
  const startTime = useRef(Date.now());
  const { analyzeWellness, wellnessState, isModelLoaded } = useWellnessAI(userId);

  useEffect(() => {
    const handleKey = () => { keystrokeCount.current += 1; };
    const handleMouse = () => { mouseMoveCount.current += 1; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousemove', handleMouse);

    const interval = setInterval(async () => {
      const endTime = Date.now();
      const summary: ActivitySummary = {
        keystrokeCount: keystrokeCount.current,
        mouseMoveCount: mouseMoveCount.current,
        startTime: startTime.current,
        endTime,
      };
      
      // Store activity summary in Firestore
      await addDoc(collection(db, 'activity_summaries'), {
        ...summary,
        userId,
        timestamp: endTime,
      });

      // Analyze wellness using AI
      if (isModelLoaded) {
        await analyzeWellness(keystrokeCount.current, mouseMoveCount.current);
      }

      keystrokeCount.current = 0;
      mouseMoveCount.current = 0;
      startTime.current = endTime;
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousemove', handleMouse);
      clearInterval(interval);
    };
  }, [userId, analyzeWellness, isModelLoaded]);

  return {
    wellnessState,
    isMonitoring: true
  };
}
