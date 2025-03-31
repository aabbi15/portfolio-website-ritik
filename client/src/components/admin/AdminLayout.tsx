import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Home, 
  Briefcase, 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  MessageCircle,
  Settings, 
  LogOut,
  BookOpen,
  Share2
} from "lucide-react";

type AdminNavLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
};

function AdminNavLink({ href, icon, label, isActive }: AdminNavLinkProps) {
  return (
    <Link href={href}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors cursor-pointer ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}>
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();
  
  const navLinks = [
    { href: "/admin/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { href: "/admin/projects", icon: <FolderKanban size={18} />, label: "Projects" },
    { href: "/admin/experience", icon: <Briefcase size={18} />, label: "Experience" },
    { href: "/admin/testimonials", icon: <MessageCircle size={18} />, label: "Testimonials" },
    { href: "/admin/blog", icon: <BookOpen size={18} />, label: "Blog" },
    { href: "/admin/social-profiles", icon: <Share2 size={18} />, label: "Social Profiles" },
    { href: "/admin/content", icon: <FileText size={18} />, label: "Site Content" },
    { href: "/admin/messages", icon: <MessageSquare size={18} />, label: "Messages" },
    { href: "/admin/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        {/* Header */}
        <div className="py-4 px-6 border-b border-border">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            {user?.username || "Admin"}
          </p>
        </div>
        
        {/* Nav links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navLinks.map((link) => (
            <AdminNavLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={location === link.href}
            />
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex-1 justify-start"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Back to Site</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm" 
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 md:pt-6 max-w-7xl mx-auto w-full">
        <div className="mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}