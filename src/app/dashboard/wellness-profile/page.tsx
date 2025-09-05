
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

const wellnessProfileSchema = z.object({
  allergies: z.array(z.object({
    name: z.string().min(1, 'Allergy name is required.'),
    severity: z.string().min(1, 'Severity is required.'),
  })).optional(),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required.'),
    dosage: z.string().min(1, 'Dosage is required.'),
  })).optional(),
  conditions: z.array(z.object({
    name: z.string().min(1, 'Condition name is required.'),
    status: z.string().min(1, 'Status is required.'),
  })).optional(),
  emergencyContacts: z.array(z.object({
    name: z.string().min(1, 'Contact name is required.'),
    relationship: z.string().min(1, 'Relationship is required.'),
    phone: z.string().min(10, 'Phone number is required.'),
  })).optional(),
});

type WellnessProfileFormValues = z.infer<typeof wellnessProfileSchema>;

export default function WellnessProfilePage() {
  const { userProfile, loading, setUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<WellnessProfileFormValues>({
    resolver: zodResolver(wellnessProfileSchema),
    defaultValues: {
      allergies: [],
      medications: [],
      conditions: [],
      emergencyContacts: [],
    },
  });
  
  const { fields: allergyFields, append: appendAllergy, remove: removeAllergy } = useFieldArray({ control: form.control, name: "allergies" });
  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({ control: form.control, name: "medications" });
  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({ control: form.control, name: "conditions" });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control: form.control, name: "emergencyContacts" });


  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        allergies: userProfile.allergies || [],
        medications: userProfile.medications || [],
        conditions: userProfile.conditions || [],
        emergencyContacts: userProfile.emergencyContacts || [],
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: WellnessProfileFormValues) => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userDocRef, values);

      setUserProfile(prev => prev ? {...prev, ...values} : null);

      toast({
        title: 'Wellness Profile Updated',
        description: 'Your medical information has been successfully saved.',
      });
    } catch (error) {
      console.error('Error updating wellness profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wellness Profile</h1>
            <p className="text-muted-foreground">
              Manage your medical information for emergency situations.
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Changes
          </Button>
        </div>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>
                List any allergies you have and their severity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allergyFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`allergies.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Allergy</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Peanuts" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`allergies.${index}.severity`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Severity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Severe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeAllergy(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="gap-2" onClick={() => appendAllergy({ name: '', severity: '' })}>
                <PlusCircle className="h-4 w-4" /> Add Allergy
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>
                List any medications you are currently taking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicationFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`medications.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Medication</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lisinopril" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10mg Daily" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="gap-2" onClick={() => appendMedication({ name: '', dosage: '' })}>
                <PlusCircle className="h-4 w-4" /> Add Medication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
              <CardDescription>
                List any important medical conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditionFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Condition</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Hypertension" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.status`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Managed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="gap-2" onClick={() => appendCondition({ name: '', status: '' })}>
                <PlusCircle className="h-4 w-4" /> Add Condition
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Who should we contact in an emergency?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactFields.map((field, index) => (
                <div key={field.id} className="space-y-2">
                   <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                      <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.name`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.relationship`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl><Input placeholder="e.g., Spouse" {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name={`emergencyContacts.${index}.phone`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl><Input placeholder="e.g., 555-123-4567" {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeContact(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="gap-2" onClick={() => appendContact({ name: '', relationship: '', phone: '' })}>
                <PlusCircle className="h-4 w-4" /> Add Contact
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
