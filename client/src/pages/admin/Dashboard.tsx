import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { MessageCircle, FolderKanban, Briefcase, BarChart3, Share2 } from "lucide-react";
import type { Project } from "@/data/projects";
import type { Experience } from "@/data/experience";
import type { Contact, SocialProfile } from "@shared/schema";

export default function AdminDashboard() {
  const { data: projects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: experiences, isLoading: isExperiencesLoading } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
  });
  
  const { data: contacts, isLoading: isContactsLoading } = useQuery<Contact[]>({
    queryKey: ['/api/admin/contacts'],
  });
  
  const { data: socialProfiles, isLoading: isSocialProfilesLoading } = useQuery<SocialProfile[]>({
    queryKey: ['/api/social-profiles'],
  });

  const dashboardItems = [
    {
      title: "Total Projects",
      value: isProjectsLoading ? "Loading..." : projects?.length || 0,
      icon: <FolderKanban className="h-6 w-6 text-primary" />,
    },
    {
      title: "Experience Entries",
      value: isExperiencesLoading ? "Loading..." : experiences?.length || 0,
      icon: <Briefcase className="h-6 w-6 text-primary" />,
    },
    {
      title: "Social Profiles",
      value: isSocialProfilesLoading ? "Loading..." : socialProfiles?.length || 0,
      icon: <Share2 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Messages",
      value: isContactsLoading ? "Loading..." : contacts?.length || 0, 
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your portfolio content and activity
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((item, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="social">
          <TabsList>
            <TabsTrigger value="social">Social Profiles</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="messages">Recent Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Social Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                {isSocialProfilesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading social profiles...</p>
                ) : socialProfiles && socialProfiles.length > 0 ? (
                  <div className="space-y-4">
                    {socialProfiles.slice(0, 5).map((profile, i: number) => (
                      <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <div className="font-medium">{profile.platform}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(profile.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm truncate mt-1">
                          <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            {profile.username || profile.profileUrl}
                          </a>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {profile.isConnected ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No social profiles connected yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {isProjectsLoading || isExperiencesLoading ? (
                    <p>Loading activity data...</p>
                  ) : (
                    <p>No recent activity to display</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {isContactsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : contacts && contacts.length > 0 ? (
                  <div className="space-y-4">
                    {contacts.slice(0, 5).map((contact, i: number) => (
                      <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm truncate mt-1">{contact.email}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {contact.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No messages to display</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}