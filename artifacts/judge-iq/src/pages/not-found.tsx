import React from "react";
import { Link } from "wouter";
import { Scale } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-panel p-12 rounded-2xl text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Scale className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="font-display text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-xl font-medium text-foreground mb-4">Jurisdiction Not Found</h2>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          The requested docket or page does not exist in our current records. Please verify the URL or return to the main chambers.
        </p>
        
        <Link href="/" className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Return to Chambers
        </Link>
      </div>
    </div>
  );
}
