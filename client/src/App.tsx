import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, lazy, Suspense } from "react";
import { AuthProvider, RequireAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/components/LanguageSwitcher";
import { PageLoading } from "@/components/ui/page-loading";

// Direct import for the most commonly used page
import Home from "@/pages/Home";

// Lazy-loaded pages for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const SimpleExperiencePage = lazy(() => import("@/pages/SimpleExperiencePage"));
const SimpleProjectsPage = lazy(() => import("@/pages/SimpleProjectsPage"));
const SimpleExperienceDetailPage = lazy(() => import("@/pages/SimpleExperienceDetailPage"));
const SimpleProjectDetailPage = lazy(() => import("@/pages/SimpleProjectDetailPage"));
const SimpleBlogPage = lazy(() => import("@/pages/SimpleBlogPage"));
const SimpleBlogDetailPage = lazy(() => import("@/pages/SimpleBlogDetailPage"));

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("@/pages/admin/Projects"));
const AdminExperience = lazy(() => import("@/pages/admin/Experience"));
const AdminTestimonials = lazy(() => import("@/pages/admin/Testimonials"));
const AdminBlog = lazy(() => import("@/pages/admin/Blog"));
const AdminContent = lazy(() => import("@/pages/admin/Content"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminSocialProfiles = lazy(() => import("@/pages/admin/SocialProfilesPage"));
const AdminDebug = lazy(() => import("@/pages/admin/Debug"));

function Router() {
  const [location] = useLocation();
  
  // Scroll to top on page navigation - keep it simple
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Wrap lazy-loaded components with Suspense for better UX during loading
  const renderWithSuspense = (Component: React.ComponentType<any>, customMessage?: string) => (
    <Suspense fallback={<PageLoading message={customMessage} />}>
      <Component />
    </Suspense>
  );
  
  return (
    <div className="app-container">
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/experience">
          {renderWithSuspense(SimpleExperiencePage, "Loading experience page...")}
        </Route>
        <Route path="/projects">
          {renderWithSuspense(SimpleProjectsPage, "Loading projects...")}
        </Route>
        <Route path="/experience/:id">
          {renderWithSuspense(SimpleExperienceDetailPage, "Loading experience details...")}
        </Route>
        <Route path="/projects/:id">
          {renderWithSuspense(SimpleProjectDetailPage, "Loading project details...")}
        </Route>
        <Route path="/blog">
          {renderWithSuspense(SimpleBlogPage, "Loading blog posts...")}
        </Route>
        <Route path="/blog/:slug">
          {renderWithSuspense(SimpleBlogDetailPage, "Loading article...")}
        </Route>
        
        {/* Admin Login Route */}
        <Route path="/admin/login">
          {renderWithSuspense(AdminLogin, "Loading login page...")}
        </Route>
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading dashboard..." />}>
              <AdminDashboard />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/projects">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading projects..." />}>
              <AdminProjects />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/experience">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading experience..." />}>
              <AdminExperience />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/testimonials">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading testimonials..." />}>
              <AdminTestimonials />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/blog">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading blog management..." />}>
              <AdminBlog />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/messages">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading messages..." />}>
              <AdminMessages />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/content">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading content manager..." />}>
              <AdminContent />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/settings">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading settings..." />}>
              <AdminSettings />
            </Suspense>
          </RequireAuth>
        </Route>
        
        <Route path="/admin/social-profiles">
          <RequireAuth>
            <Suspense fallback={<PageLoading message="Loading social profiles..." />}>
              <AdminSocialProfiles />
            </Suspense>
          </RequireAuth>
        </Route>
        
        {/* Debug page - accessible without auth */}
        <Route path="/admin/debug">
          {renderWithSuspense(AdminDebug, "Loading debug page...")}
        </Route>
        
        {/* 404 Fallback */}
        <Route>
          {renderWithSuspense(NotFound, "Page not found...")}
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
