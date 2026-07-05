import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Route, Cpu, Activity, GitBranch } from "lucide-react";

export function Slide05SystemMap() {
  const components = [
    {
      name: "sandbox-controller",
      icon: GitBranch,
      role: "Control Plane",
      color: "text-primary",
      desc: "Reconciles SandboxSet, SandboxClaim, SandboxTemplate, Sandbox CRDs. Runs admission webhooks.",
    },
    {
      name: "sandbox-manager",
      icon: Server,
      role: "API Server",
      color: "text-accent",
      desc: "Stateless. Provides E2B-compatible REST + MCP APIs. Schedules, creates, and recycles Sandbox instances.",
    },
    {
      name: "sandbox-gateway",
      icon: Route,
      role: "Data Plane",
      color: "text-emerald-400",
      desc: "Envoy + Golang filter. Routes traffic to the right Sandbox Pod. Load balancing + circuit breaking.",
    },
    {
      name: "agent-runtime",
      icon: Activity,
      role: "Sidecar",
      color: "text-amber-400",
      desc: "Injected into each Sandbox Pod. Provides E2B envd-compatible command/file ops, dynamic CSI mounts.",
    },
    {
      name: "Sandbox Pod",
      icon: Cpu,
      role: "Workload",
      color: "text-pink-400",
      desc: "The actual isolated execution environment. Managed by sandbox-controller via the Sandbox CRD.",
    },
  ];

  return (
    <SlideLayout
      heading="OpenKruise Agents — System Map"
      subheading="Five components form the complete Kubernetes-native sandbox runtime"
      badge="Architecture"
    >
      <div className="grid grid-cols-5 gap-3">
        {components.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.name} className="border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-lg bg-muted/60 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="text-xs">{c.role}</Badge>
                <h3 className="font-mono text-xs font-bold text-foreground leading-tight">{c.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">K8s compatibility:</span> Kubernetes ≥ 1.28
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">CNCF sub-project</span> of OpenKruise — vendor-neutral
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
