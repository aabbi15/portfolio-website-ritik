import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDebug() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status directly with the API
  const checkAuthApi = async () => {
    try {
      setError(null);
      const response = await fetch("/api/auth/me", { 
        credentials: "include" 
      });
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError("Error checking authentication: " + String(err));
    }
  };

  // Try to log in directly from this page
  const tryLogin = async () => {
    try {
      setError(null);
      const response = await apiRequest("POST", "/api/auth/login", { 
        username: "admin", 
        password: "admin123" 
      });
      const data = await response.json();
      setApiResponse({ login: data });
      
      // Check auth status after login
      await checkAuth();
    } catch (err) {
      setError("Error logging in: " + String(err));
    }
  };

  useEffect(() => {
    checkAuthApi();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication Debug Page</CardTitle>
          <CardDescription>
            Use this page to debug authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Auth Context State:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify({ user, isAuthenticated, isLoading }, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Direct API Response:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {apiResponse ? JSON.stringify(apiResponse, null, 2) : "No response yet"}
            </pre>
          </div>
          
          {error && (
            <div className="bg-destructive/20 p-4 rounded-md text-destructive">
              <h3 className="text-lg font-semibold">Error:</h3>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button onClick={checkAuthApi}>
            Check Auth Status
          </Button>
          <Button onClick={tryLogin} variant="outline">
            Try Login
          </Button>
          <Button onClick={checkAuth} variant="secondary">
            Update Context
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}