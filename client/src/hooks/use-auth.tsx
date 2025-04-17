import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginMutation: ReturnType<typeof useMutation<any, Error, LoginCredentials>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Query for checking authentication status
  const { data: authData, refetch: refetchAuth } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/auth/me");
        return response;
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          // Not authenticated, return null
          return null;
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Update auth state when query data changes
  useEffect(() => {
    if (authData && authData.authenticated && authData.user) {
      // If authenticated, set the user object
      setUser(authData.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [authData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("/api/auth/login", { method: "POST" }, credentials);
      return response;
    },
    onSuccess: (data) => {
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Store the response in the expected format for /api/auth/me
        queryClient.setQueryData(["/api/auth/me"], {
          authenticated: true,
          user: data.user
        });
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        });
      } else {
        toast({
          title: "Login error",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
      return true;
    },
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      // Update the cached data to match the expected format
      queryClient.setQueryData(["/api/auth/me"], { authenticated: false });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      setLocation("/admin/login");
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };

  // Manual auth check function
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      await refetchAuth();
    } catch (error) {
      console.error("Error checking authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        loginMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  // Check auth status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    // Only redirect when we're sure about authentication state and not on login page
    if (!isLoading && !isAuthenticated && !location.includes("/admin/login")) {
      console.log("Not authenticated, redirecting to login");
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated (except on login page)
  if (!isAuthenticated && !location.includes("/admin/login")) {
    return null;
  }

  // Render children if authenticated or on login page
  return <>{children}</>;
}