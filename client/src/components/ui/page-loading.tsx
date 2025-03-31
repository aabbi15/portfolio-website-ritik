import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}