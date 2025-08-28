"use client"

import { useState } from "react"
import { Bell, HeartPulse, Pill, Siren, Users, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { medicalHistory as initialMedicalHistory, user } from "@/lib/data"
import { EmergencyAlertButton } from "@/components/emergency-alert-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Allergy, Condition, Medication, EmergencyContact } from "@/lib/types"

type EditableSection = 'allergies' | 'medications' | 'conditions' | 'contacts' | null;

export default function DashboardPage() {
  const [medicalHistory, setMedicalHistory] = useState(initialMedicalHistory);
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = (section: EditableSection) => {
    setEditingSection(section);
    setDialogOpen(true);
  }

  const handleAllergyChange = (index: number, field: keyof Allergy, value: string) => {
    const newAllergies = [...medicalHistory.allergies];
    (newAllergies[index] as any)[field] = value;
    setMedicalHistory({ ...medicalHistory, allergies: newAllergies });
  };

  const addAllergy = () => {
    const newAllergies = [...medicalHistory.allergies, { name: '', severity: 'Low', details: '' }];
    setMedicalHistory({ ...medicalHistory, allergies: newAllergies });
  };

  const removeAllergy = (index: number) => {
    const newAllergies = medicalHistory.allergies.filter((_, i) => i !== index);
    setMedicalHistory({ ...medicalHistory, allergies: newAllergies });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medicalHistory.medications];
    (newMedications[index] as any)[field] = value;
    setMedicalHistory({ ...medicalHistory, medications: newMedications });
  };

  const addMedication = () => {
    const newMedications = [...medicalHistory.medications, { name: '', dosage: '', reason: '' }];
    setMedicalHistory({ ...medicalHistory, medications: newMedications });
  };

  const removeMedication = (index: number) => {
    const newMedications = medicalHistory.medications.filter((_, i) => i !== index);
    setMedicalHistory({ ...medicalHistory, medications: newMedications });
  };

  const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...medicalHistory.conditions];
    (newConditions[index] as any)[field] = value;
    setMedicalHistory({ ...medicalHistory, conditions: newConditions });
  };

  const addCondition = () => {
    const newConditions = [...medicalHistory.conditions, { name: '', diagnosed: new Date().toISOString().split('T')[0], status: 'Active' }];
    setMedicalHistory({ ...medicalHistory, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = medicalHistory.conditions.filter((_, i) => i !== index);
    setMedicalHistory({ ...medicalHistory, conditions: newConditions });
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...medicalHistory.emergencyContacts];
    (newContacts[index] as any)[field] = value;
    setMedicalHistory({ ...medicalHistory, emergencyContacts: newContacts });
  };

  const addContact = () => {
    const newContacts = [...medicalHistory.emergencyContacts, { name: '', relationship: '', phone: '' }];
    setMedicalHistory({ ...medicalHistory, emergencyContacts: newContacts });
  };

  const removeContact = (index: number) => {
    const newContacts = medicalHistory.emergencyContacts.filter((_, i) => i !== index);
    setMedicalHistory({ ...medicalHistory, emergencyContacts: newContacts });
  };


  const renderEditForm = () => {
    switch (editingSection) {
      case 'allergies':
        return (
          <div className="space-y-4">
            {medicalHistory.allergies.map((allergy, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-2 border rounded-md">
                 <div>
                    <Label htmlFor={`allergy-name-${index}`}>Name</Label>
                    <Input id={`allergy-name-${index}`} value={allergy.name} onChange={(e) => handleAllergyChange(index, 'name', e.target.value)} />
                 </div>
                <div>
                  <Label htmlFor={`allergy-severity-${index}`}>Severity</Label>
                  <Select value={allergy.severity} onValueChange={(value) => handleAllergyChange(index, 'severity', value)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                    <Label htmlFor={`allergy-details-${index}`}>Details</Label>
                    <Input id={`allergy-details-${index}`} value={allergy.details} onChange={(e) => handleAllergyChange(index, 'details', e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAllergy(index)}><Trash2 className="text-destructive"/></Button>
              </div>
            ))}
            <Button variant="outline" onClick={addAllergy} className="gap-2"><PlusCircle/>Add Allergy</Button>
          </div>
        );
      case 'medications':
         return (
          <div className="space-y-4">
            {medicalHistory.medications.map((med, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-2 border rounded-md">
                <div>
                  <Label htmlFor={`med-name-${index}`}>Name</Label>
                  <Input id={`med-name-${index}`} value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                  <Input id={`med-dosage-${index}`} value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`med-reason-${index}`}>Reason</Label>
                  <Input id={`med-reason-${index}`} value={med.reason} onChange={(e) => handleMedicationChange(index, 'reason', e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMedication(index)}><Trash2 className="text-destructive"/></Button>
              </div>
            ))}
            <Button variant="outline" onClick={addMedication} className="gap-2"><PlusCircle/>Add Medication</Button>
          </div>
        );
      case 'conditions':
        return (
          <div className="space-y-4">
            {medicalHistory.conditions.map((condition, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-2 border rounded-md">
                <div>
                  <Label htmlFor={`condition-name-${index}`}>Name</Label>
                  <Input id={`condition-name-${index}`} value={condition.name} onChange={(e) => handleConditionChange(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`condition-diagnosed-${index}`}>Diagnosed Date</Label>
                  <Input type="date" id={`condition-diagnosed-${index}`} value={condition.diagnosed} onChange={(e) => handleConditionChange(index, 'diagnosed', e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor={`condition-status-${index}`}>Status</Label>
                  <Select value={condition.status} onValueChange={(value) => handleConditionChange(index, 'status', value)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Managed">Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeCondition(index)}><Trash2 className="text-destructive"/></Button>
              </div>
            ))}
            <Button variant="outline" onClick={addCondition} className="gap-2"><PlusCircle/>Add Condition</Button>
          </div>
        );
        case 'contacts':
          return (
            <div className="space-y-4">
              {medicalHistory.emergencyContacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-2 border rounded-md">
                  <div>
                    <Label htmlFor={`contact-name-${index}`}>Name</Label>
                    <Input id={`contact-name-${index}`} value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`contact-relationship-${index}`}>Relationship</Label>
                    <Input id={`contact-relationship-${index}`} value={contact.relationship} onChange={(e) => handleContactChange(index, 'relationship', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                    <Input id={`contact-phone-${index}`} value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeContact(index)}><Trash2 className="text-destructive"/></Button>
                </div>
              ))}
              <Button variant="outline" onClick={addContact} className="gap-2"><PlusCircle/>Add Emergency Contact</Button>
            </div>
          );
      default:
        return <p>Select a section to edit.</p>;
    }
  };

  const getDialogTitle = () => {
    if (!editingSection) return "Edit Section";
    return `Edit ${editingSection.charAt(0).toUpperCase() + editingSection.slice(1)}`;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <EmergencyAlertButton medicalHistory={medicalHistory} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Bell className="text-destructive" /> Allergies
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => openDialog('allergies')}>Edit</Button>
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
              <Button variant="outline" size="sm" onClick={() => openDialog('medications')}>Edit</Button>
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
               <Button variant="outline" size="sm" onClick={() => openDialog('conditions')}>Edit</Button>
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
              <Button variant="outline" size="sm" onClick={() => openDialog('contacts')}>Edit</Button>
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
           <DialogDescription>
            Add, edit, or remove entries for this section. Your changes will be saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {renderEditForm()}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button>Done</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
