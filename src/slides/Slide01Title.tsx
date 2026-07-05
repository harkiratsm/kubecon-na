import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin } from "lucide-react";

export function Slide01Title() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-16 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="accent" className="text-xs tracking-wider uppercase px-3 py-1">
            KubeCon + CloudNativeCon Japan 2026
          </Badge>
          <Badge variant="secondary" className="text-xs">
            AI + ML Track
          </Badge>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 text-foreground">
          Checkpoint-Backed{" "}
          <span className="text-primary">Warm Pools</span>{" "}
          for Agentic AI Workloads on Kubernetes
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sub-second sandboxes · Durable state · Safe runtime evolution
        </p>

        <Separator className="my-8 max-w-md mx-auto" />

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>29 Jul 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>3:50 – 4:20 pm JST</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Room 5F | 501, Tokyo</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground">Project</span>
            <span className="text-sm font-semibold text-foreground">OpenKruise Agents</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground">Foundation</span>
            <span className="text-sm font-semibold text-foreground">CNCF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
