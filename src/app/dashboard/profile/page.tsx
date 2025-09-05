
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  bayName: z.string().min(1, 'Bay name is required.'),
  seatNumber: z.string().min(1, 'Seat number is required.'),
  wifiName: z.string().min(1, 'Wi-Fi name is required.'),
});

export default function ProfilePage() {
  const { userProfile, loading, setUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bayName: '',
      seatNumber: '',
      wifiName: '',
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        email: userProfile.email,
        bayName: userProfile.bayName || '',
        seatNumber: userProfile.seatNumber || '',
        wifiName: userProfile.wifiName || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', userProfile.uid);
      const updatedData = {
        name: values.name,
        bayName: values.bayName,
        seatNumber: values.seatNumber,
        wifiName: values.wifiName,
      };
      await updateDoc(userDocRef, updatedData);

      // Optimistically update local profile state
      setUserProfile(prev => prev ? {...prev, ...updatedData} : null);

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const userInitials = userProfile?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '';

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          View and edit your personal and location details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be used for your account and for emergency services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" disabled>Change Photo</Button>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@wipro.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardDescription>
                Your location details are crucial for a fast response in an emergency.
              </CardDescription>
               <div className="grid md:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="bayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bay Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Delta Wing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. D-34" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wifiName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wi-Fi Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Wipro-Guest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
