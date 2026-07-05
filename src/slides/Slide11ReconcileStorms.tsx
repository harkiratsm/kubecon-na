import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export function Slide11ReconcileStorms() {
  const stormRisks = [
    "100 agents claim sandboxes simultaneously",
    "All trigger SandboxSet scale-up at once",
    "API server flooded with reconcile events",
    "New Pods schedule in a burst → resource contention",
  ];

  const mitigations = [
    {
      title: "Best-Effort Gradual Delivery",
      desc: "Batch claims deliver sandboxes one-by-one as they become available, not all-or-nothing",
      badge: "Core Pattern",
    },
    {
      title: "Pool-First Path",
      desc: "Claims try warm pool first (sub-second). If pool is empty, default behavior is to wait for replenishment — not auto-create.",
      badge: "Latency Guard",
    },
    {
      title: "Optimized Scale-Up",
      desc: "SandboxSet uses low-latency scaling specifically optimized for high-frequency scaling scenarios",
      badge: "Controller Design",
    },
    {
      title: "Template-Direct Opt-In",
      desc: "Set createOnNoStock: true on SandboxClaim to skip pool wait and create from template directly — trades speed for immediacy",
      badge: "Escape Hatch",
    },
  ];

  return (
    <SlideLayout
      heading="Avoiding Reconcile Storms"
      subheading="High-throughput claiming without thundering-herd problems — design decisions that matter at scale"
      badge="SandboxClaim"
    >
      <TwoColumn
        ratio="1:2"
        left={
          <Card className="h-full border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-semibold text-sm text-foreground">Without mitigation</span>
              </div>
              <ol className="space-y-2">
                {stormRisks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-destructive font-mono shrink-0">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ol>
              <ArrowRight className="w-4 h-4 text-destructive mt-3 mx-auto" />
              <p className="text-xs text-destructive text-center mt-1 font-semibold">API server overload</p>
            </CardContent>
          </Card>
        }
        right={
          <div className="space-y-2">
            {mitigations.map((m) => (
              <Card key={m.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex gap-3 items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{m.title}</span>
                      <Badge variant="secondary" className="text-xs">{m.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      />
    </SlideLayout>
  );
}
