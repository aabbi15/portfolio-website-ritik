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
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Loader2, Upload, Image, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FormDescription,
} from "@/components/ui/form";

type SiteContent = {
  id: number;
  section: string;
  key: string;
  value: string;
  type: string;
};

// Form schema
const contentFormSchema = z.object({
  section: z.string().min(2, { message: "Section must be at least 2 characters" }),
  key: z.string().min(2, { message: "Key must be at least 2 characters" }),
  value: z.string().min(1, { message: "Value is required" }),
  type: z.enum(["text", "html", "json", "image"], {
    errorMap: () => ({ message: "Please select a valid type" }),
  }),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

export default function AdminContent() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editContent, setEditContent] = useState<SiteContent | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: contentItems, isLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/content'],
  });
  
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/content/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Content deleted",
        description: "The content item has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      section: "",
      key: "",
      value: "",
      type: "text",
    },
    mode: "onChange",
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: ContentFormValues) => {
      return apiRequest("/api/admin/content", { method: "POST" }, data);
    },
    onSuccess: () => {
      toast({
        title: "Content created",
        description: "Your new content item has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content",
        variant: "destructive",
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: ContentFormValues & { id: number }) => {
      const { id, ...contentData } = data;
      return apiRequest(`/api/admin/content/${id}`, { method: "PATCH" }, contentData);
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "The content item has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setEditContent(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update content",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContentFormValues) => {
    if (editContent) {
      updateContentMutation.mutate({ ...data, id: editContent.id });
    } else {
      createContentMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteContentMutation.mutate(id);
  };

  // Handle file selection with optional compression
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 40) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 40MB, or consider using a URL instead.",
        variant: "destructive",
      });
      return;
    }
    
    // Show progress if it's a large file
    if (sizeMB > 5) {
      toast({
        title: "Processing image",
        description: "Large image detected. Processing...",
      });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // For large images, we could add compression here
      // For now, just use the image as-is
      setImagePreview(result);
      
      // Update form value with base64 data
      form.setValue('value', result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image browser button click
  const handleImageBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEdit = (content: SiteContent) => {
    setEditContent(content);
    
    // Set image preview if this is image content
    if (content.type === 'image') {
      // If it's a file path, convert to full URL for preview
      if (content.value.startsWith('/uploads/')) {
        setImagePreview(content.value);
      } else {
        setImagePreview(content.value);
      }
    } else {
      setImagePreview(null);
    }
    
    form.reset({
      section: content.section,
      key: content.key,
      value: content.value,
      type: content.type as "text" | "html" | "json" | "image",
    });
  };

  const handleCloseDialog = () => {
    setEditContent(null);
    setShowAddDialog(false);
    setImagePreview(null);
    form.reset();
  };
  
  // Watch for content type changes
  const contentType = form.watch('type');

  // Group content by section
  const contentBySection = contentItems?.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, SiteContent[]>) || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Content</h1>
            <p className="text-muted-foreground">
              Manage your website content
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Content
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !contentItems || contentItems.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <h3 className="text-lg font-medium">No content items found</h3>
            <p className="text-muted-foreground mt-2">
              Create your first content item to get started
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Content
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(contentBySection).map((section) => (
              <div key={section} className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <h3 className="font-medium text-lg">{section}</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentBySection[section].map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.key}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {content.value.length > 100 
                            ? `${content.value.substring(0, 100)}...` 
                            : content.value}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{content.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(content)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteId(content.id)}
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
            ))}
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              content item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteContentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContentMutation.isPending ? (
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

      <Dialog open={showAddDialog || editContent !== null} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editContent ? "Edit Content" : "Add New Content"}</DialogTitle>
            <DialogDescription>
              {editContent 
                ? "Update this content item" 
                : "Add a new content item to your website"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input placeholder="hero" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md"
                        {...field}
                      >
                        <option value="text">Text</option>
                        <option value="html">HTML</option>
                        <option value="json">JSON</option>
                        <option value="image">Image</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {contentType === 'image' ? (
                <div>
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleFileChange}
                            />
                            
                            {imagePreview && (
                              <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-full h-full object-contain"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                                  onClick={() => {
                                    setImagePreview(null);
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-3">
                              <Button 
                                type="button"
                                onClick={handleImageBrowse}
                                variant="default"
                                className="w-full"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {imagePreview ? 'Replace Image' : 'Upload Image'}
                              </Button>
                              
                              <div className="text-center text-sm text-muted-foreground">
                                or
                              </div>
                              
                              <Input
                                type="text"
                                placeholder="Enter image URL (optional)"
                                value={!imagePreview && field.value ? field.value : ""}
                                onChange={(e) => {
                                  // If a URL is entered, clear the image preview
                                  if (e.target.value && imagePreview) {
                                    setImagePreview(null);
                                  }
                                  field.onChange(e.target.value);
                                }}
                                className="w-full"
                              />
                            </div>
                            
                            <Textarea 
                              className="hidden"
                              {...field}
                              value={imagePreview || field.value}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload an image file (JPG, PNG, GIF, max 40MB) or provide a URL for larger images
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div>
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Value</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter content here..." 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createContentMutation.isPending || updateContentMutation.isPending}
                >
                  {(createContentMutation.isPending || updateContentMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editContent ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editContent ? "Update Content" : "Create Content"
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