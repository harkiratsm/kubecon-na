import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, RefreshCw, HardDrive, ArrowRight } from "lucide-react";

export function Slide17RehydrationSteps() {
  const steps = [
    {
      number: "01",
      icon: Copy,
      title: "Clone from Checkpoint",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      details: [
        "sandbox-manager receives the clone request",
        "Backing driver restores memory + filesystem from snapshot",
        "New Sandbox CR + Pod created with fresh identity",
      ],
    },
    {
      number: "02",
      icon: CheckCircle,
      title: "Wait for Readiness",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
      details: [
        "Controller polls sandbox phase until Running",
        "agent-runtime sidecar initializes (port 49983)",
        "Standard Kubernetes readiness checks pass",
      ],
    },
    {
      number: "03",
      icon: RefreshCw,
      title: "Re-initialize Runtime",
      color: "text-accent",
      bgColor: "bg-accent/10 border-accent/20",
      details: [
        "Optional: re-inject environment variables at claim time",
        "Extent of memory restore depends on checkpoint driver and cluster platform",
        "Note: full memory semantics are platform-dependent (e.g. ACS)",
      ],
    },
    {
      number: "04",
      icon: HardDrive,
      title: "Per-Session Dynamic Mounts",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
      details: [
        "CSI driver attaches per-user PVCs at claim time",
        "spec.runtimes must include csi to enable",
        "Enables user workspace data to survive across sessions",
      ],
    },
  ];

  return (
    <SlideLayout
      heading="Rehydration — 4-Step Flow"
      subheading="sandbox-manager orchestrates the full restore sequence from checkpoint to ready sandbox"
      badge="Rehydration"
    >
      <div className="flex items-stretch gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Card className={`w-full border ${step.bgColor} flex-1`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-black text-border/50 font-mono">{step.number}</span>
                    <div className={`p-1.5 rounded-lg bg-muted/60 ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className={`font-bold text-sm mb-2 ${step.color}`}>{step.title}</h3>
                  <ul className="space-y-1.5">
                    {step.details.map((d, di) => (
                      <li key={di} className="flex gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-border shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden lg:block rotate-0 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
        <p className="text-xs text-muted-foreground">
          <Badge variant="secondary" className="mr-2 font-mono text-xs">agent-runtime</Badge>
          requires port <span className="font-mono text-foreground">49983</span> open on all Sandbox Pods — ensure firewall/security groups allow it
        </p>
      </div>
    </SlideLayout>
  );
}
