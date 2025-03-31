import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BlogPost, BlogComment } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Trash2, PenSquare, Eye, PlusCircle, CheckCircle2, XCircle, FileText } from "lucide-react";

// Blog post editor component
function BlogPostEditor({
  post,
  isOpen,
  onClose,
  onSave
}: {
  post?: BlogPost;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<BlogPost>) => void;
}) {
  const [title, setTitle] = useState<string>(post?.title || "");
  const [slug, setSlug] = useState<string>(post?.slug || "");
  const [content, setContent] = useState<string>(post?.content || "");
  const [summary, setSummary] = useState<string>(post?.summary || "");
  const [featuredImage, setFeaturedImage] = useState<string>(post?.featuredImage || "");
  const [category, setCategory] = useState<string>(post?.category || "tech");
  const [isPublished, setIsPublished] = useState<boolean>(post?.isPublished || false);
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>(
    post?.tags 
      ? (typeof post.tags === 'string' 
          ? (post.tags as string).split(",").filter(Boolean) 
          : (post.tags as string[]))
      : []
  );

  // Generate slug from title
  const generateSlug = () => {
    if (!title) return;

    const slugText = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Replace multiple - with single -

    setSlug(slugText);
  };

  // Add tag to tags list
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    
    setTagInput("");
  };

  // Remove tag from tags list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!title || !slug || !content || !summary) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave({
      title,
      slug,
      content,
      summary,
      featuredImage: featuredImage || undefined,
      category,
      tags: tags.length > 0 ? tags : [], // Maintain tags as an array for saving
      isPublished
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {post 
              ? "Make changes to your blog post here. Click save when you're done."
              : "Fill in the details for your new blog post. All fields are required."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {/* Main content area with tabs */}
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="meta">Meta & Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              {/* Title field with visual feedback */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  placeholder="Enter an attention-grabbing title"
                  onBlur={() => !slug && generateSlug()}
                />
                {title && (
                  <p className="text-xs text-muted-foreground">
                    Character count: {title.length}/100 (recommended maximum)
                  </p>
                )}
              </div>
              
              {/* Slug field with improved UI */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="slug" className="text-base font-medium">
                    URL Slug
                  </Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={generateSlug}
                    className="h-6 px-2 text-xs"
                    disabled={!title}
                  >
                    Generate from title
                  </Button>
                </div>
                <div className="flex items-center gap-2 border p-2 rounded-md bg-muted/30">
                  <span className="text-muted-foreground text-sm">/blog/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0"
                    placeholder="your-post-slug"
                  />
                </div>
              </div>
              
              {/* Summary field */}
              <div className="space-y-2">
                <Label htmlFor="summary" className="text-base font-medium">
                  Summary
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of your post (appears in previews and search results)"
                  rows={3}
                />
                {summary && (
                  <p className="text-xs text-muted-foreground">
                    Character count: {summary.length}/160 (recommended for SEO)
                  </p>
                )}
              </div>
              
              {/* Featured image with upload option */}
              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-base font-medium">
                  Featured Image
                </Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <span className="text-sm font-medium">Option 1: Upload Image</span>
                    </div>
                    <ImageUpload 
                      onImageUpload={(imagePath) => {
                        if (imagePath) {
                          setFeaturedImage(imagePath);
                        }
                      }}
                      initialImage={featuredImage && featuredImage.startsWith('/uploads/') ? featuredImage : undefined}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-2 flex items-center">
                      <span className="text-sm font-medium">Option 2: External URL</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="featuredImage"
                        value={!featuredImage || !featuredImage.startsWith('/uploads/') ? featuredImage : ''}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full"
                      />
                      {featuredImage && !featuredImage.startsWith('/uploads/') && (
                        <div className="mt-2 rounded-md overflow-hidden border h-40 bg-muted/20 flex items-center justify-center">
                          <img 
                            src={featuredImage} 
                            alt="Featured" 
                            className="max-h-full object-contain" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image or provide a URL. Images will be automatically resized to fit the blog layout.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              {/* Markdown content editor with improved styling */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium flex justify-between">
                  <span>Content (Markdown)</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {content.length} characters
                  </span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Write your post content here... Markdown is supported."
                  rows={16}
                />
              </div>
              
              {/* Formatting help card */}
              <Card className="bg-muted/10">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Markdown Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs"># Heading</code>
                      <span>Heading 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">**Bold**</code>
                      <span>Bold text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">## Heading</code>
                      <span>Heading 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">*Italic*</code>
                      <span>Italic text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">[Link](url)</code>
                      <span>Hyperlink</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">![Alt](url)</code>
                      <span>Image</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">- Item</code>
                      <span>List item</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">\`code\`</code>
                      <span>Inline code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">&gt; Quote</code>
                      <span>Blockquote</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded text-xs">```code```</code>
                      <span>Code block</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meta" className="space-y-4">
              {/* Category field with improved UI */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="tech">Technology</option>
                  <option value="career">Career</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="project">Project</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              {/* Tags field with visual improvements */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base font-medium">
                  Tags
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1"
                      placeholder="Enter tag name"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      Add Tag
                    </Button>
                  </div>
                  
                  <div className="border rounded-md bg-muted/20 p-3 min-h-[100px]">
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="py-1 px-3 text-sm bg-background"
                          >
                            {tag}
                            <button 
                              type="button" 
                              className="ml-2 rounded-full text-muted-foreground hover:text-destructive" 
                              onClick={() => removeTag(tag)}
                              title="Remove tag"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">No tags added yet</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tags help readers find related content. Add 3-5 relevant tags.
                  </p>
                </div>
              </div>
              
              {/* Published toggle with visual enhancements */}
              <div className="space-y-2 mt-4">
                <div className="border rounded-md p-4 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Publication Status</h4>
                      <p className="text-sm text-muted-foreground">
                        {isPublished 
                          ? 'This post will be visible to all visitors' 
                          : 'This post will be saved as a draft (only visible to admins)'}
                      </p>
                    </div>
                    <Switch 
                      id="isPublished" 
                      checked={isPublished} 
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="border-t pt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="min-w-[100px]">
            {post ? 'Update Post' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Comment management component
function CommentsList({ postId }: { postId?: number }) {
  const { toast } = useToast();
  
  const { data: comments, isLoading: isLoadingComments } = useQuery<BlogComment[]>({
    queryKey: [postId ? `/api/admin/blog/comments?postId=${postId}` : '/api/admin/blog/comments'],
    enabled: true,
  });

  // Approve comment mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: number; approve: boolean }) => {
      const response = await fetch(`/api/admin/blog/comments/${id}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/comments'] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/blog/comments?postId=${postId}`] });
      }
      toast({
        title: 'Comment Updated',
        description: 'Comment approval status has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update comment status.',
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/comments'] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/blog/comments?postId=${postId}`] });
      }
      toast({
        title: 'Comment Deleted',
        description: 'Comment has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      });
    },
  });

  if (isLoadingComments) {
    return <p className="text-center py-4 text-muted-foreground">Loading comments...</p>;
  }

  if (!comments || comments.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No comments found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>Comment</TableHead>
          <TableHead>Post</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.map((comment: BlogComment) => (
          <TableRow key={comment.id}>
            <TableCell className="font-medium">{comment.name}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate">{comment.content}</div>
            </TableCell>
            <TableCell>{comment.postId}</TableCell>
            <TableCell>
              {comment.isApproved ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
              )}
            </TableCell>
            <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {comment.isApproved ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => approveMutation.mutate({ id: comment.id, approve: false })}
                    title="Disapprove"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => approveMutation.mutate({ id: comment.id, approve: true })}
                    title="Approve"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this comment?')) {
                      deleteMutation.mutate(comment.id);
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Main admin blog component
export default function AdminBlog() {
  const [showEditor, setShowEditor] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | undefined>(undefined);
  const { toast } = useToast();
  
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog/posts'],
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setShowEditor(false);
      toast({
        title: 'Success',
        description: 'Blog post created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create blog post.',
        variant: 'destructive',
      });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, post }: { id: number; post: Partial<BlogPost> }) => {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      setShowEditor(false);
      setCurrentPost(undefined);
      toast({
        title: 'Success',
        description: 'Blog post updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update blog post.',
        variant: 'destructive',
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateOrUpdate = (post: Partial<BlogPost>) => {
    if (currentPost) {
      updateMutation.mutate({ id: currentPost.id, post });
    } else {
      createMutation.mutate(post);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setShowEditor(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground">
              Create, edit and manage your blog posts and comments
            </p>
          </div>
          
          <Button onClick={() => {
            setCurrentPost(undefined);
            setShowEditor(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
        
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading blog posts...</p>
            ) : posts && posts.length > 0 ? (
              <div className="grid gap-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {post.featuredImage && (
                                <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                                  <img 
                                    src={post.featuredImage} 
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{post.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                  {post.summary}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.isPublished ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.viewCount}</TableCell>
                          <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(post)}
                                title="Edit"
                              >
                                <PenSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(post.id)}
                                title="Delete"
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
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Blog Posts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first blog post.
                  </p>
                  <Button onClick={() => {
                    setCurrentPost(undefined);
                    setShowEditor(true);
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comment Management</CardTitle>
                <CardDescription>
                  Review and moderate comments on your blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommentsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Blog post editor dialog */}
      <BlogPostEditor
        post={currentPost}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setCurrentPost(undefined);
        }}
        onSave={handleCreateOrUpdate}
      />
    </AdminLayout>
  );
}