import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Save } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form schema for password update
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AdminSettings() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Setup form for password change
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Handle password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // Note: This is where you would add the actual API endpoint when ready
      return apiRequest("/api/admin/change-password", { method: "POST" }, data);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PasswordFormValues) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    toast({
      title: newDarkMode ? "Dark mode enabled" : "Light mode enabled",
      description: "Your preference has been saved",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                View and update your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={user?.username || ""}
                  disabled
                  className="max-w-sm bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your username cannot be changed
                </p>
              </div>
              
              <div className="space-y-1">
                <Label>Admin Status</Label>
                <div className="flex items-center space-x-2 h-10">
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    user?.isAdmin ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {user?.isAdmin ? "Administrator" : "Regular User"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your current password"
                            className="max-w-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your new password"
                            className="max-w-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          At least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your new password"
                            className="max-w-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit"
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the admin panel looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Admin Theme Preferences</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-12 justify-start" disabled>
                    <span className="h-4 w-4 rounded-full mr-2 bg-primary" />
                    <span>Default</span>
                  </Button>
                  <Button variant="outline" className="h-12 justify-start opacity-50" disabled>
                    <span className="h-4 w-4 rounded-full mr-2 bg-indigo-500" />
                    <span>Purple</span>
                  </Button>
                  <Button variant="outline" className="h-12 justify-start opacity-50" disabled>
                    <span className="h-4 w-4 rounded-full mr-2 bg-teal-500" />
                    <span>Teal</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Additional themes coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}