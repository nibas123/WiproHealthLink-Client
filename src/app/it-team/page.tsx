
"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import type { Emergency, UserProfile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Monitor, CheckCircle, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"


const createUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["user", "doctor", "it_team"], { required_error: "Please select a role." }),
  bayName: z.string().optional(),
  seatNumber: z.string().optional(),
  wifiName: z.string().optional(),
}).refine(data => {
    if (data.role === 'user') {
        return !!data.bayName && !!data.seatNumber && !!data.wifiName;
    }
    return true;
}, {
    message: "Bay, Seat, and Wi-Fi are required for employees.",
    path: ["bayName"] 
});

export default function ITTeamDashboardPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "emergencies"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activeEmergencies: Emergency[] = [];
      querySnapshot.forEach((doc) => {
        activeEmergencies.push({ id: doc.id, ...doc.data() } as Emergency);
      });
      activeEmergencies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEmergencies(activeEmergencies);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resolveEmergency = async (id: string) => {
    const emergencyRef = doc(db, "emergencies", id);
    try {
      await updateDoc(emergencyRef, { status: "resolved" });
      toast({
        title: "Emergency Resolved",
        description: "The alert has been marked as resolved.",
      });
    } catch (error) {
        console.error("Error resolving emergency: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not resolve the emergency. Please try again.",
        })
    }
  };

  return (
    <div className="grid gap-6">
       <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Monitor className="text-primary"/> Wipro IT Team Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Manage active emergencies and user accounts.
                </p>
            </div>
            <CreateUserDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Emergencies</CardTitle>
          <CardDescription>
            These alerts require immediate attention from medical and IT staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Bay Name</TableHead>
                <TableHead>Seat Number</TableHead>
                <TableHead>Wi-Fi Name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : emergencies.length > 0 ? (
                emergencies.map((emergency) => (
                  <TableRow key={emergency.id} className="font-medium">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emergency.userAvatar} alt={emergency.userName} />
                          <AvatarFallback>{emergency.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{emergency.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{emergency.bayName}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{emergency.seatNumber}</Badge>
                    </TableCell>
                    <TableCell>{emergency.wifiName}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(emergency.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => resolveEmergency(emergency.id)} className="gap-2">
                        <CheckCircle />
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No active emergencies.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateUserDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "user",
            bayName: "",
            seatNumber: "",
            wifiName: "",
        },
    });

    const role = form.watch("role");

    const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
        setLoading(true);
        try {
            // Because creating a user with the client SDK logs out the current user,
            // we should get the current user's credentials to log them back in after.
            // NOTE: This is a workaround for not using a server-side function.
            const currentAdmin = auth.currentUser;
            if (!currentAdmin) {
                throw new Error("No admin currently logged in. Please log in again.");
            }

            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const userProfileData: Omit<UserProfile, 'uid' | 'avatar'> = {
                name: values.name,
                email: values.email,
                role: values.role,
                bayName: values.bayName || '',
                seatNumber: values.seatNumber || '',
                wifiName: values.wifiName || '',
            };

            await setDoc(doc(db, "users", user.uid), {
                ...userProfileData,
                avatar: `https://i.pravatar.cc/150?u=${user.uid}`
            });

            // Re-authenticate the admin user
            if (currentAdmin.email) {
                 // This part is tricky without knowing the password. A better approach is Cloud Functions.
                 // For now, we'll just notify the admin they need to log back in.
                 await auth.signOut();
            }

            toast({
                title: "User Created Successfully",
                description: `Account for ${values.name} created. You have been logged out and need to log back in to continue.`,
            });
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast({
                variant: "destructive",
                title: "User Creation Failed",
                description: error.message || "An unknown error occurred. You may need to log back in.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new account for an employee or doctor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
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
                                        <Input placeholder="name@wipro.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="user">Employee</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="it_team">IT Team</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {role === 'user' && (
                            <div className="space-y-4 border p-4 rounded-md bg-muted/50">
                                <FormField
                                    control={form.control}
                                    name="bayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bay Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="E.g., Delta Wing" {...field} />
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
                                                <Input placeholder="E.g., D-34" {...field} />
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
                                                <Input placeholder="E.g., Wipro-Guest" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <DialogFooter className="sticky bottom-0 bg-background pt-4">
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
