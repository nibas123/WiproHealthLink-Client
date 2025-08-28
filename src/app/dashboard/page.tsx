import { Bell, HeartPulse, Pill, Siren, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { medicalHistory, user } from "@/lib/data"
import { EmergencyAlertButton } from "@/components/emergency-alert-button"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s a summary of your medical profile. Keep it up to date.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <EmergencyAlertButton />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bell className="text-destructive" /> Allergies
            </CardTitle>
            <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {medicalHistory.allergies.map((allergy) => (
                <li key={allergy.name} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{allergy.name}</p>
                    <p className="text-sm text-muted-foreground">{allergy.details}</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{allergy.severity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Pill className="text-primary" /> Medications
            </CardTitle>
             <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
              {medicalHistory.medications.map((med) => (
                <li key={med.name} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.reason}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{med.dosage}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <HeartPulse className="text-primary" /> Conditions
            </CardTitle>
             <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
              {medicalHistory.conditions.map((condition) => (
                <li key={condition.name} className="flex justify-between items-start">
                   <div>
                    <p className="font-medium">{condition.name}</p>
                    <p className="text-sm text-muted-foreground">Diagnosed: {new Date(condition.diagnosed).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold">{condition.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="text-primary" /> Emergency Contacts
            </CardTitle>
             <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
              {medicalHistory.emergencyContacts.map((contact) => (
                <li key={contact.name} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{contact.phone}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
