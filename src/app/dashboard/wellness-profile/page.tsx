
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function WellnessProfilePage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wellness Profile</h1>
        <p className="text-muted-foreground">
          Manage your medical information for emergency situations.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Allergies Section */}
        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>
              List any allergies you have and their severity. This is critical for medical staff.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Allergy</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="e.g., Peanuts" />
                  <Input placeholder="e.g., Severe" />
                  <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                 <div className="flex items-center gap-2">
                  <Input placeholder="e.g., Penicillin" />
                  <Input placeholder="e.g., High" />
                  <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <PlusCircle className="h-4 w-4" /> Add Allergy
              </Button>
              <Separator />
              <Button disabled>Save Allergies</Button>
            </form>
             <p className="text-xs text-muted-foreground mt-4">Functionality to add, remove, and save is coming soon.</p>
          </CardContent>
        </Card>

        {/* Medications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
            <CardDescription>
              List any medications you are currently taking.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form className="space-y-4">
              <div className="space-y-2">
                <Label>Medication</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="e.g., Lisinopril" />
                  <Input placeholder="e.g., 10mg Daily" />
                  <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <PlusCircle className="h-4 w-4" /> Add Medication
              </Button>
              <Separator />
              <Button disabled>Save Medications</Button>
            </form>
             <p className="text-xs text-muted-foreground mt-4">Functionality to add, remove, and save is coming soon.</p>
          </CardContent>
        </Card>

        {/* Medical Conditions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Conditions</CardTitle>
            <CardDescription>
              List any important medical conditions.
            </CardDescription>
          </CardHeader>
           <CardContent>
             <form className="space-y-4">
              <div className="space-y-2">
                <Label>Condition</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="e.g., Hypertension" />
                  <Input placeholder="e.g., Managed" />
                   <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <PlusCircle className="h-4 w-4" /> Add Condition
              </Button>
              <Separator />
              <Button disabled>Save Conditions</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">Functionality to add, remove, and save is coming soon.</p>
          </CardContent>
        </Card>

         {/* Emergency Contacts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>
             Who should we contact in an emergency?
            </CardDescription>
          </CardHeader>
           <CardContent>
             <form className="space-y-4">
              <div className="space-y-2">
                <Label>Contact</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="e.g., John Doe" />
                  <Input placeholder="e.g., Spouse" />
                  <Input placeholder="e.g., 555-123-4567" />
                </div>
              </div>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <PlusCircle className="h-4 w-4" /> Add Contact
              </Button>
              <Separator />
              <Button disabled>Save Contacts</Button>
            </form>
             <p className="text-xs text-muted-foreground mt-4">Functionality to add, remove, and save is coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
