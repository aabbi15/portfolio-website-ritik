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

type Testimonial = {
  id: number;
  name: string;
  position: string;
  company: string;
  text: string;
  image: string;
  updatedAt: string;
};

// Form validation schema
const formFields = {
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  company: z.string().min(2, { message: "Company must be at least 2 characters" }),
  text: z.string().min(10, { message: "Testimonial text must be at least 10 characters" }),
  image: z.string()
    .refine(val => {
      // Accept URL or data URL (for uploaded images)
      return val.startsWith("http") || val.startsWith("https") || 
             val.startsWith("data:image/") || 
             val === "uploaded_image_placeholder";
    }, { message: "Please enter a valid image URL or upload an image" }),
};

// Form schema used for React Hook Form
const testimonialFormSchema = z.object(formFields);

// API schema with transformations
export const testimonialApiSchema = z.object(formFields);

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export default function AdminTestimonials() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form setup
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: "",
      position: "",
      company: "",
      text: "",
      image: "",
    },
  });

  // Query to fetch all testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["/api/testimonials"],
    queryFn: () => apiRequest("/api/testimonials") as Promise<Testimonial[]>,
  });

  // Mutation to create a new testimonial
  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormValues) => {
      // If we used the image uploader, use that image
      if (uploadedImage) {
        data.image = uploadedImage;
      }
      
      return apiRequest("/api/admin/testimonials", {
        method: "POST",
      }, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setIsDialogOpen(false);
      form.reset();
      setUploadedImage(null);
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create testimonial",
        variant: "destructive",
      });
    },
  });

  // Mutation to update an existing testimonial
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TestimonialFormValues }) => {
      // If we used the image uploader, use that image
      if (uploadedImage) {
        data.image = uploadedImage;
      }
      
      return apiRequest(`/api/admin/testimonials/${id}`, {
        method: "PUT",
      }, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      setUploadedImage(null);
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update testimonial",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a testimonial
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setIsDeleteAlertOpen(false);
      setDeleteId(null);
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete testimonial",
        variant: "destructive",
      });
    },
  });

  // Handle form submission for create/update
  const onSubmit = (data: TestimonialFormValues) => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open dialog to add a new testimonial
  const handleAddNew = () => {
    form.reset({
      name: "",
      position: "",
      company: "",
      text: "",
      image: "",
    });
    setEditingId(null);
    setUploadedImage(null);
    setIsDialogOpen(true);
  };

  // Open dialog to edit a testimonial
  const handleEdit = (testimonial: Testimonial) => {
    form.reset({
      name: testimonial.name,
      position: testimonial.position,
      company: testimonial.company,
      text: testimonial.text,
      image: testimonial.image,
    });
    setEditingId(testimonial.id);
    setUploadedImage(null);
    setIsDialogOpen(true);
  };

  // Open confirm dialog to delete a testimonial
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteAlertOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        // We'll set a dummy value to satisfy form validation
        form.setValue("image", "uploaded_image_placeholder", { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : testimonials && testimonials.length > 0 ? (
        <div className="bg-white dark:bg-card rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="hidden md:table-cell">Testimonial</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">
                    {testimonial.image && (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell>{testimonial.name}</TableCell>
                  <TableCell>{testimonial.position}</TableCell>
                  <TableCell>{testimonial.company}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="line-clamp-1">{testimonial.text}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-background border border-border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No testimonials found</h3>
          <p className="text-muted-foreground mb-4">
            Add your first testimonial to showcase what people say about you.
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Testimonial
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the testimonial information below."
                : "Fill out the form to add a new testimonial."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ritik Mahyavanshi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="CEO" {...field} />
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
                      <Input placeholder="Example Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What they said about you..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <div className="space-y-3">
                      {uploadedImage ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={uploadedImage}
                            alt="Uploaded preview"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUploadedImage(null);
                              field.onChange("");
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // If user types in URL, clear any uploaded image
                                if (e.target.value && uploadedImage) {
                                  setUploadedImage(null);
                                }
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">or</span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={triggerFileInput}
                              size="sm"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this testimonial. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}