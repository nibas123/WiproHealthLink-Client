// AI-powered wellness detection using TensorFlow.js
import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { toast } from '../hooks/use-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface WellnessState {
  isOverworked: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  lastAlert: number;
}

export function useWellnessAI(userId: string) {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [wellnessState, setWellnessState] = useState<WellnessState>({
    isOverworked: false,
    riskLevel: 'low',
    confidence: 0,
    lastAlert: 0
  });
  const activityBuffer = useRef<number[][]>([]);
  const alertCooldown = 30 * 60 * 1000; // 30 minutes between alerts

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // In production, load the actual trained model
        // const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json');
        
        // For demo, create a simple model
        const demoModel = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [2], units: 16, activation: 'relu' }),
            tf.layers.dense({ units: 1, activation: 'sigmoid' })
          ]
        });
        
        setModel(demoModel);
      } catch (error) {
        console.error('Failed to load wellness AI model:', error);
      }
    };
    
    loadModel();
  }, []);

  // Analyze activity data and predict wellness
  const analyzeWellness = async (keystrokeCount: number, mouseMoveCount: number) => {
    if (!model) return;

    // Normalize activity data (adjust based on your baseline)
    const normalizedKeystrokes = Math.min(keystrokeCount / 1000, 1);
    const normalizedMouse = Math.min(mouseMoveCount / 5000, 1);
    
    activityBuffer.current.push([normalizedKeystrokes, normalizedMouse]);
    
    // Keep only last 12 data points (1 hour of 5-minute intervals)
    if (activityBuffer.current.length > 12) {
      activityBuffer.current.shift();
    }

    // Need at least 6 data points (30 minutes) for analysis
    if (activityBuffer.current.length < 6) return;

    try {
      // Calculate average activity over the window
      const avgActivity = activityBuffer.current.reduce((acc, curr) => [
        acc[0] + curr[0], acc[1] + curr[1]
      ], [0, 0]).map(sum => sum / activityBuffer.current.length);

      const prediction = model.predict(tf.tensor2d([avgActivity])) as tf.Tensor;
      const confidence = await prediction.data();
      const riskScore = confidence[0];

      let riskLevel: WellnessState['riskLevel'] = 'low';
      if (riskScore > 0.8) riskLevel = 'critical';
      else if (riskScore > 0.6) riskLevel = 'high';
      else if (riskScore > 0.4) riskLevel = 'medium';

      const isOverworked = riskScore > 0.5;
      const now = Date.now();

      setWellnessState({
        isOverworked,
        riskLevel,
        confidence: riskScore,
        lastAlert: wellnessState.lastAlert
      });

      // Trigger alerts if overworked and not in cooldown
      if (isOverworked && now - wellnessState.lastAlert > alertCooldown) {
        await triggerWellnessAlert(riskLevel, riskScore);
        setWellnessState(prev => ({ ...prev, lastAlert: now }));
      }

      prediction.dispose();
    } catch (error) {
      console.error('Wellness analysis failed:', error);
    }
  };

  const triggerWellnessAlert = async (riskLevel: string, confidence: number) => {
    const alertMessage = getAlertMessage(riskLevel);
    
    // Show toast notification
    toast({
      title: "Wellness Alert",
      description: alertMessage,
      variant: riskLevel === 'critical' ? 'destructive' : 'default',
    });

    // Log wellness event
    await addDoc(collection(db, 'wellness_events'), {
      userId,
      type: 'overwork_detected',
      riskLevel,
      confidence,
      timestamp: Date.now(),
      message: alertMessage
    });

    // If critical, alert doctors
    if (riskLevel === 'critical') {
      await addDoc(collection(db, 'doctor_alerts'), {
        userId,
        type: 'critical_fatigue',
        riskLevel,
        confidence,
        timestamp: Date.now(),
        status: 'pending'
      });
    }
  };

  const getAlertMessage = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
        return 'Critical fatigue detected! Please take an immediate break and consider consulting a doctor.';
      case 'high':
        return 'High activity detected. Please take a 15-minute break to rest your eyes and stretch.';
      case 'medium':
        return 'Consider taking a short break to maintain optimal wellness.';
      default:
        return 'Remember to take regular breaks for better health.';
    }
  };

  return {
    wellnessState,
    analyzeWellness,
    isModelLoaded: !!model
  };
}
