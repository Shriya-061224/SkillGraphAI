import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-danger/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="w-24 h-24 text-danger animate-pulse" />
        </div>
        <h1 className="text-6xl font-display font-bold">404</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The node you are looking for does not exist in our knowledge graph.
        </p>
        <Link href="/" className="inline-block mt-4">
          <Button variant="outline" size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
