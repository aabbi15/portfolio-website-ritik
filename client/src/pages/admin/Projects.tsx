import { useState, useRef } from "react";
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

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  technologies: string[];
  tags: string[];
  link: string;
};

// Form validation schema
// Base schema for form validation
const formFields = {
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  image: z.string()
    .refine(val => {
      // Accept URL or data URL (for uploaded images)
      return val.startsWith("http") || val.startsWith("https") || 
             val.startsWith("data:image/") || 
             val === "uploaded_image_placeholder";
    }, { message: "Please enter a valid image URL or upload an image" }),
  category: z.enum(["frontend", "backend", "fullstack", "app", "ml", "dl", "ai"], { 
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  technologies: z.string()
    .min(3, { message: "Please enter at least one technology" }),
  tags: z.string()
    .min(3, { message: "Please enter at least one tag" }),
  link: z.string().url({ message: "Please enter a valid project URL" }),
};

// Form schema used for React Hook Form
const projectFormSchema = z.object(formFields);

// API schema with transformations
export const projectApiSchema = z.object({
  ...formFields,
  technologies: z.string()
    .min(3, { message: "Please enter at least one technology" })
    .transform(val => val.split(',').map(item => item.trim())),
  tags: z.string()
    .min(3, { message: "Please enter at least one tag" })
    .transform(val => val.split(',').map(item => item.trim())),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function AdminProjects() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      category: "backend",
      technologies: "",
      tags: "",
      link: "",
    },
    mode: "onChange",
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Use the API schema to transform the form data
      const apiData = projectApiSchema.parse(data);
      const response = await apiRequest("POST", "/api/admin/projects", apiData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your new project has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    },
  });

  // Handle image file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadedImage(file);
    
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Update the form field with a placeholder value
      form.setValue("image", "uploaded_image_placeholder");
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload button click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: ProjectFormValues) => {
    // If we have an uploaded image, we need to upload it to a hosting service
    // and get a URL before submitting the form
    // For now, we'll just use the preview URL as a demonstration
    if (uploadedImage && imagePreview) {
      const formWithImage = {
        ...data,
        image: imagePreview,
      };
      createProjectMutation.mutate(formWithImage);
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteProjectMutation.mutate(id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your portfolio projects
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mt-2">
              Create your first project to get started
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <Badge key={i} variant="outline">{tech}</Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline">+{project.technologies.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(project.id)}
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
              project and remove it from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? (
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
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add a new project to showcase in your portfolio
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
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="fullstack">Full Stack</option>
                          <option value="app">App Development</option>
                          <option value="ml">Machine Learning</option>
                          <option value="dl">Deep Learning</option>
                          <option value="ai">AI</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Project description" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>Or Upload an Image</Label>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerFileUpload}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                        <div className="relative rounded-md overflow-hidden border w-40 h-40">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, Express" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Web, Frontend, Backend" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
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