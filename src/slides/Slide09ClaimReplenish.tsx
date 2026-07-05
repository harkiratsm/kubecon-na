import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight } from "lucide-react";

export function Slide09ClaimReplenish() {
  const stages = [
    {
      label: "Stage 1",
      title: "Pool Full",
      desc: "replicas=3, availableReplicas=3",
      color: "border-emerald-500/30 bg-emerald-500/5",
      badge: "Steady State",
      badgeVariant: "success" as const,
      boxes: [
        { label: "Sandbox-1", state: "available", external: false },
        { label: "Sandbox-2", state: "available", external: false },
        { label: "Sandbox-3", state: "available", external: false },
      ],
    },
    {
      label: "Stage 2",
      title: "Agent Claims",
      desc: "replicas=2, availableReplicas=2 · scale-up triggered",
      color: "border-amber-500/30 bg-amber-500/5",
      badge: "Transitioning",
      badgeVariant: "warning" as const,
      boxes: [
        { label: "Sandbox-2", state: "available", external: false },
        { label: "Sandbox-3", state: "available", external: false },
        { label: "Sandbox-1", state: "claimed", external: true },
      ],
    },
    {
      label: "Stage 3",
      title: "New Sandbox Creating",
      desc: "replicas=3, availableReplicas=2",
      color: "border-primary/20 bg-primary/5",
      badge: "Replenishing",
      badgeVariant: "default" as const,
      boxes: [
        { label: "Sandbox-2", state: "available", external: false },
        { label: "Sandbox-3", state: "available", external: false },
        { label: "Sandbox-4", state: "creating", external: false },
      ],
    },
    {
      label: "Stage 4",
      title: "Pool Restored",
      desc: "replicas=3, availableReplicas=3",
      color: "border-emerald-500/30 bg-emerald-500/5",
      badge: "Steady State",
      badgeVariant: "success" as const,
      boxes: [
        { label: "Sandbox-2", state: "available", external: false },
        { label: "Sandbox-3", state: "available", external: false },
        { label: "Sandbox-4", state: "available", external: false },
      ],
    },
  ];

  const stateColors: Record<string, string> = {
    available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    claimed: "bg-primary/20 text-primary border-primary/30",
    creating: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <SlideLayout
      heading="Claim & Replenish Loop"
      subheading="SandboxSet.replicas counts only unclaimed inventory — the controller auto-replenishes on every claim"
      badge="Warm Pool"
    >
      <div className="grid grid-cols-4 gap-3">
        {stages.map((stage, si) => (
          <div key={si} className="flex flex-col items-center gap-2">
            <Card className={`w-full border ${stage.color}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{stage.label}</span>
                  <Badge variant={stage.badgeVariant} className="text-xs">{stage.badge}</Badge>
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{stage.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 font-mono">{stage.desc}</p>
                <div className="space-y-1.5">
                  {stage.boxes.map((box, bi) => (
                    <div
                      key={bi}
                      className={`flex items-center justify-between px-2 py-1 rounded border text-xs font-mono ${
                        box.external
                          ? "border-dashed border-primary/40 bg-primary/5 text-primary"
                          : stateColors[box.state]
                      }`}
                    >
                      <span>{box.label}</span>
                      <span className="opacity-70">{box.external ? "→ Agent" : box.state}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {si < stages.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 justify-center text-xs text-muted-foreground">
        <ArrowDown className="w-3 h-3" />
        <span>replicas field excludes claimed sandboxes — pool size is always the target buffer, not total</span>
      </div>
    </SlideLayout>
  );
}
