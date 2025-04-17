import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Eye, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Experience = {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
  achievements: string[];
  category: string;
  logo?: string;
};

// Base schema for form validation
const formFields = {
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  period: z.string().min(3, { message: "Period must be at least 3 characters" }),
  category: z.enum(["backend", "frontend", "ai-ml", "devops", "management"], { 
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters" }),
  technologies: z.string()
    .min(3, { message: "Please enter at least one technology" }),
  achievements: z.string()
    .min(3, { message: "Please enter at least one achievement" }),
  logo: z.string()
    .refine(val => {
      // Accept URL or data URL (for uploaded logos) or empty string
      return val === "" || 
             val.startsWith("http") || 
             val.startsWith("https") || 
             val.startsWith("data:image/") || 
             val === "uploaded_logo_placeholder";
    }, { message: "Please enter a valid logo URL or upload an image" })
    .optional(),
};

// Form schema used for React Hook Form
const experienceFormSchema = z.object(formFields);

// API schema with transformations
export const experienceApiSchema = z.object({
  ...formFields,
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters" })
    .transform(val => val.split('\n').filter(line => line.trim().length > 0)),
  technologies: z.string()
    .min(3, { message: "Please enter at least one technology" })
    .transform(val => val.split(',').map(item => item.trim())),
  achievements: z.string()
    .min(3, { message: "Please enter at least one achievement" })
    .transform(val => val.split('\n').filter(line => line.trim().length > 0)),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export default function AdminExperience() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: experiences, isLoading } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
  });
  
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/experiences/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Experience deleted",
        description: "The experience entry has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete experience",
        variant: "destructive",
      });
    },
  });
  
  // Edit mutation for updating existing experiences
  const editExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ExperienceFormValues }) => {
      // Use the API schema to transform the form data
      const apiData = experienceApiSchema.parse(data);
      return apiRequest(`/api/admin/experiences/${id}`, { method: "PUT" }, apiData);
    },
    onSuccess: () => {
      toast({
        title: "Experience updated",
        description: "Your experience entry has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setShowEditDialog(false);
      setEditId(null);
      form.reset();
      setLogoPreview("");
      setUploadedLogo(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update experience",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      period: "",
      category: "backend",
      description: "",
      technologies: "",
      achievements: "",
      logo: "",
    },
    mode: "onChange",
  });

  const createExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      // Use the API schema to transform the form data
      const apiData = experienceApiSchema.parse(data);
      return apiRequest("/api/admin/experiences", { method: "POST" }, apiData);
    },
    onSuccess: () => {
      toast({
        title: "Experience created",
        description: "Your new experience entry has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create experience",
        variant: "destructive",
      });
    },
  });

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadedLogo(file);
    
    // Create a preview URL for the logo
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      // Update the form field with a placeholder value
      form.setValue("logo", "uploaded_logo_placeholder");
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload button click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: ExperienceFormValues) => {
    // If we have an uploaded logo, use the data URL
    if (uploadedLogo && logoPreview) {
      const formWithLogo = {
        ...data,
        logo: logoPreview,
      };
      createExperienceMutation.mutate(formWithLogo);
    } else {
      createExperienceMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteExperienceMutation.mutate(id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
            <p className="text-muted-foreground">
              Manage your work experience entries
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !experiences || experiences.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <h3 className="text-lg font-medium">No experience entries found</h3>
            <p className="text-muted-foreground mt-2">
              Create your first experience entry to get started
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiences.map((experience) => (
                  <TableRow key={experience.id}>
                    <TableCell className="font-medium">{experience.title}</TableCell>
                    <TableCell>{experience.company}</TableCell>
                    <TableCell>{experience.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{experience.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/experience/${experience.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditId(experience.id);
                            
                            // Populate form with existing data
                            form.reset({
                              title: experience.title,
                              company: experience.company,
                              location: experience.location,
                              period: experience.period,
                              category: experience.category as "backend" | "frontend" | "ai-ml" | "devops" | "management",
                              description: experience.description.join('\n'),
                              technologies: experience.technologies.join(', '),
                              achievements: experience.achievements.join('\n'),
                              logo: experience.logo || "",
                            });
                            
                            // Set logo preview if exists
                            if (experience.logo) {
                              setLogoPreview(experience.logo);
                            } else {
                              setLogoPreview("");
                            }
                            
                            setShowEditDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(experience.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              experience entry and remove it from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteExperienceMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExperienceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Experience</DialogTitle>
            <DialogDescription>
              Add a new work experience entry to showcase in your portfolio
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Period</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan 2020 - Present" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md"
                        {...field}
                      >
                        <option value="backend">Backend</option>
                        <option value="frontend">Frontend</option>
                        <option value="ai-ml">AI/ML</option>
                        <option value="devops">DevOps</option>
                        <option value="management">Management</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter job responsibilities (one per line)" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <FormControl>
                        <Input placeholder="Python, SQL, AWS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label>Or Upload a Logo</Label>
                    <div className="flex flex-col gap-4">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={triggerFileUpload}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Logo
                      </Button>
                      
                      {logoPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                          <div className="relative rounded-md overflow-hidden border w-40 h-40">
                            <img 
                              src={logoPreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Achievements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter key achievements (one per line)" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createExperienceMutation.isPending}
                >
                  {createExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Experience"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>
              Update the details of this experience entry
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit((data) => {
                if (editId) {
                  // If we have an uploaded logo, use the data URL
                  if (uploadedLogo && logoPreview) {
                    const formWithLogo = {
                      ...data,
                      logo: logoPreview,
                    };
                    editExperienceMutation.mutate({ id: editId, data: formWithLogo });
                  } else {
                    editExperienceMutation.mutate({ id: editId, data });
                  }
                }
              })} 
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Period</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan 2020 - Present" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md"
                        {...field}
                      >
                        <option value="backend">Backend</option>
                        <option value="frontend">Frontend</option>
                        <option value="ai-ml">AI/ML</option>
                        <option value="devops">DevOps</option>
                        <option value="management">Management</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter job responsibilities (one per line)" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <FormControl>
                        <Input placeholder="Python, SQL, AWS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label>Or Upload a Logo</Label>
                    <div className="flex flex-col gap-4">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={triggerFileUpload}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Logo
                      </Button>
                      
                      {logoPreview && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                          <div className="relative rounded-md overflow-hidden border w-40 h-40">
                            <img 
                              src={logoPreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Achievements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter key achievements (one per line)" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditId(null);
                    form.reset();
                    setLogoPreview("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={editExperienceMutation.isPending}
                >
                  {editExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Experience"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}