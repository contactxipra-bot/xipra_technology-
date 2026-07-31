import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen pt-32 pb-0 bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center gap-6 relative z-10 border-primary/20 bg-background/50 animate-pulse shadow-[0_0_40px_rgba(var(--primary),0.1)]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10 relative z-10 backdrop-blur-md">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Preparing Experience</h2>
          <p className="text-foreground/50 text-sm max-w-[250px] mx-auto">
            Loading our premium showcase. Just a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
