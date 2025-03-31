import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any, D = any>(
  url: string,
  options?: RequestInit,
  data?: D
): Promise<T> {
  console.log(`Making API request: ${options?.method || 'GET'} ${url}`, data || options?.body);
  
  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    credentials: "include",
    ...options
  };
  
  // If data is provided separately, it overrides any body in options
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  console.log("Request options:", fetchOptions);
  const res = await fetch(url, fetchOptions);
  console.log(`Response status: ${res.status}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API error (${res.status}):`, errorText);
    throw new Error(`${res.status}: ${errorText || res.statusText}`);
  }
  
  // For 204 No Content, just return null as there is no body
  if (res.status === 204) {
    return null as T;
  }
  
  // Otherwise parse JSON response
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Making query request: GET ${url}`);
    
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });
    
    console.log(`Query response status: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log("Unauthorized request (401), returning null");
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Query error (${res.status}):`, errorText);
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Query response data:", data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
