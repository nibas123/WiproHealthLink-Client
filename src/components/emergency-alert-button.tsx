"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { summarizeMedicalHistory } from "@/ai/flows/summarize-medical-history"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useGlobalState } from "@/hooks/use-global-state"


export function EmergencyAlertButton() {
  const { currentUser, medicalHistory, addAlert } = useGlobalState()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAlert = async () => {
    setLoading(true)
    setError(null)
    setSummary(null)
    setLocation(null)

    if (!medicalHistory) {
        setError("Medical history not loaded yet.")
        setLoading(false)
        return
    }

    // 1. Get location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentPosition = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`
        setLocation(currentPosition)

        // 2. Stringify medical history
        const historyString = `
          Allergies: ${medicalHistory.allergies.map(a => `${a.name} (${a.severity})`).join(", ") || 'none'}.
          Conditions: ${medicalHistory.conditions.map(c => c.name).join(", ") || 'none'}.
          Medications: ${medicalHistory.medications.map(m => `${m.name} ${m.dosage}`).join(", ") || 'none'}.
        `
        // 3. Call GenAI flow
        try {
          const result = await summarizeMedicalHistory({
            medicalHistory: historyString,
            currentLocation: currentPosition,
          })
          setSummary(result.summary)
        } catch (e) {
          console.error(e)
          setError("Failed to generate emergency summary.")
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.")
        setLoading(false)
      }
    )
  }
  
  const sendAlert = async () => {
    if (!summary || !location || !currentUser) return

    await addAlert({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        location: location,
        summary: summary,
    });

     toast({
        title: "✅ Emergency Alert Sent",
        description: "The on-duty doctor has been notified with your medical summary and location.",
      })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2" onClick={handleAlert}>
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Emergency Alert</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately send your medical summary and current location to the Wipro on-duty doctor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating summary and getting location...</p>
          </div>
        )}
        {error && (
            <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>
        )}
        {summary && (
            <div>
                <h3 className="font-semibold mb-2">Generated Summary:</h3>
                <p className="text-sm p-4 bg-muted rounded-md border">{summary}</p>
            </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={sendAlert} disabled={loading || !!error || !summary}>
            Send Alert Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
