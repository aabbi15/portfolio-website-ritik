import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, RefreshCw, User, Link, Verified, AtSign, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SocialProfile } from '@shared/schema';
import { Switch } from '@/components/ui/switch';

export default function SocialProfilesManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<SocialProfile | null>(null);
  
  // Form state for creating/editing profiles
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    displayName: '',
    bio: '',
    profileUrl: '',
    avatarUrl: '',
    isConnected: true,
    accessToken: '',
    refreshToken: '',
  });
  
  // Query to fetch all social profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/social-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/social-profiles');
      if (!response.ok) throw new Error('Failed to fetch social profiles');
      return response.json();
    }
  });
  
  // Mutation to create a new social profile
  const createMutation = useMutation({
    mutationFn: (profileData: typeof formData) => {
      return apiRequest('/api/admin/social-profiles', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-profiles'] });
      toast({
        title: 'Success',
        description: 'Social profile created successfully',
        variant: 'default',
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create social profile: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to update an existing social profile
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: typeof formData }) => {
      return apiRequest(`/api/admin/social-profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-profiles'] });
      toast({
        title: 'Success',
        description: 'Social profile updated successfully',
        variant: 'default',
      });
      setIsEditDialogOpen(false);
      setCurrentProfile(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update social profile: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to delete a social profile
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/social-profiles/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-profiles'] });
      toast({
        title: 'Success',
        description: 'Social profile deleted successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete social profile: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to sync a social profile
  const syncMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/social-profiles/${id}/sync`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-profiles'] });
      toast({
        title: 'Success',
        description: 'Social profile synced successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to sync social profile: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch/checkbox changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isConnected: checked }));
  };
  
  // Handle form submission for creating a new profile
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };
  
  // Handle form submission for updating a profile
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProfile) {
      updateMutation.mutate({ id: currentProfile.id, data: formData });
    }
  };
  
  // Open edit dialog and populate form with profile data
  const handleEditClick = (profile: SocialProfile) => {
    setCurrentProfile(profile);
    setFormData({
      platform: profile.platform,
      username: profile.username,
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      profileUrl: profile.profileUrl,
      avatarUrl: profile.avatarUrl || '',
      isConnected: profile.isConnected,
      accessToken: profile.accessToken || '',
      refreshToken: profile.refreshToken || '',
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle profile deletion with confirmation
  const handleDeleteClick = (id: number) => {
    if (window.confirm('Are you sure you want to delete this social profile?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Reset form to default values
  const resetForm = () => {
    setFormData({
      platform: '',
      username: '',
      displayName: '',
      bio: '',
      profileUrl: '',
      avatarUrl: '',
      isConnected: true,
      accessToken: '',
      refreshToken: '',
    });
  };
  
  // Filter profiles based on active tab
  const filteredProfiles = profiles.filter((profile: SocialProfile) => {
    if (activeTab === 'all') return true;
    return profile.platform === activeTab;
  });
  
  // Get unique platforms for filter tabs
  const platformSet = new Set<string>();
  profiles.forEach((profile: SocialProfile) => platformSet.add(profile.platform));
  const platforms = Array.from(platformSet);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get platform-specific style (color and icon)
  const getPlatformStyle = (platform: string) => {
    const styles: Record<string, { color: string, bg: string }> = {
      linkedin: { color: 'text-blue-600', bg: 'bg-blue-100' },
      github: { color: 'text-slate-800', bg: 'bg-slate-100' },
      twitter: { color: 'text-blue-400', bg: 'bg-blue-50' },
      facebook: { color: 'text-blue-700', bg: 'bg-blue-100' },
      instagram: { color: 'text-pink-600', bg: 'bg-pink-50' },
      youtube: { color: 'text-red-600', bg: 'bg-red-50' },
      tiktok: { color: 'text-black', bg: 'bg-slate-100' },
      default: { color: 'text-gray-600', bg: 'bg-gray-100' }
    };
    
    return styles[platform] || styles.default;
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Social Media Profiles</h2>
          <p className="text-muted-foreground">
            Manage your connected social media accounts and profiles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Social Profile</DialogTitle>
              <DialogDescription>
                Connect a new social media profile to your portfolio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">
                    Platform
                  </Label>
                  <Input
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    placeholder="linkedin, github, etc."
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your username"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="displayName" className="text-right">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your display name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profileUrl" className="text-right">
                    Profile URL
                  </Label>
                  <Input
                    id="profileUrl"
                    name="profileUrl"
                    value={formData.profileUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatarUrl" className="text-right">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Your profile bio"
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isConnected" className="text-right">
                    Connected
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch 
                      id="isConnected" 
                      checked={formData.isConnected}
                      onCheckedChange={handleSwitchChange}
                    />
                    <span>{formData.isConnected ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accessToken" className="text-right">
                    Access Token
                  </Label>
                  <Input
                    id="accessToken"
                    name="accessToken"
                    value={formData.accessToken}
                    onChange={handleInputChange}
                    placeholder="Optional API access token"
                    className="col-span-3"
                    type="password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="refreshToken" className="text-right">
                    Refresh Token
                  </Label>
                  <Input
                    id="refreshToken"
                    name="refreshToken"
                    value={formData.refreshToken}
                    onChange={handleInputChange}
                    placeholder="Optional API refresh token"
                    className="col-span-3"
                    type="password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Profile'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Social Profile</DialogTitle>
              <DialogDescription>
                Update your social media profile information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-platform" className="text-right">
                    Platform
                  </Label>
                  <Input
                    id="edit-platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    placeholder="linkedin, github, etc."
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="edit-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your username"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-displayName" className="text-right">
                    Display Name
                  </Label>
                  <Input
                    id="edit-displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your display name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-profileUrl" className="text-right">
                    Profile URL
                  </Label>
                  <Input
                    id="edit-profileUrl"
                    name="profileUrl"
                    value={formData.profileUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-avatarUrl" className="text-right">
                    Avatar URL
                  </Label>
                  <Input
                    id="edit-avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="edit-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Your profile bio"
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-isConnected" className="text-right">
                    Connected
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch 
                      id="edit-isConnected" 
                      checked={formData.isConnected}
                      onCheckedChange={handleSwitchChange}
                    />
                    <span>{formData.isConnected ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-accessToken" className="text-right">
                    Access Token
                  </Label>
                  <Input
                    id="edit-accessToken"
                    name="accessToken"
                    value={formData.accessToken}
                    onChange={handleInputChange}
                    placeholder="Optional API access token"
                    className="col-span-3"
                    type="password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-refreshToken" className="text-right">
                    Refresh Token
                  </Label>
                  <Input
                    id="edit-refreshToken"
                    name="refreshToken"
                    value={formData.refreshToken}
                    onChange={handleInputChange}
                    placeholder="Optional API refresh token"
                    className="col-span-3"
                    type="password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Profiles</TabsTrigger>
          {platforms.map(platform => (
            <TabsTrigger key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading social profiles...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No social profiles found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Your First Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile: SocialProfile) => {
                const platformStyle = getPlatformStyle(profile.platform);
                
                return (
                  <Card key={profile.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${platformStyle.bg} ${platformStyle.color}`}>
                            {profile.platform}
                          </Badge>
                          {profile.isConnected ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="flex items-center mt-2">
                        <AtSign className="h-4 w-4 mr-1" />
                        {profile.username}
                      </CardTitle>
                      <CardDescription>
                        {profile.displayName || profile.username}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.bio && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{profile.bio}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between mt-1">
                          <span>Last Synced:</span>
                          <span>{formatDate(profile.lastSynced)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Updated:</span>
                          <span>{formatDate(profile.updatedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 justify-between">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(profile)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncMutation.mutate(profile.id)}
                          disabled={syncMutation.isPending}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}