import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowLeftRight, Camera, GitCommit } from "lucide-react";

export function Slide21Patterns() {
  const patterns = [
    {
      number: "01",
      icon: Layers,
      title: "Warm Pool Manager",
      color: "text-primary",
      border: "border-primary/20 bg-primary/5",
      badge: "Startup",
      principles: [
        "Keep availableReplicas slightly above peak burst",
        "Monitor AVAILABLE in your SRE dashboards",
        "SandboxSet excludes claimed sandboxes from replica count",
        "Scale pool down during off-hours to save cost",
      ],
    },
    {
      number: "02",
      icon: ArrowLeftRight,
      title: "High-Throughput Claim Controller",
      color: "text-accent",
      border: "border-accent/20 bg-accent/5",
      badge: "Scale",
      principles: [
        "Use gradual delivery — never block on all-or-nothing",
        "Set claimTimeout to bound the worst case",
        "Pool-first path guarantees sub-second for normal load",
        "Use createOnNoStock: true on SandboxClaim to bypass pool wait when needed",
      ],
    },
    {
      number: "03",
      icon: Camera,
      title: "Checkpoint Lifecycle",
      color: "text-emerald-400",
      border: "border-emerald-500/20 bg-emerald-500/5",
      badge: "Reliability",
      principles: [
        "Checkpoint at meaningful task milestones, not just on exit",
        "Use ttlAfterFinished to avoid checkpoint sprawl",
        "snapshotId == Checkpoint.name — same object in CRD and SDK",
        "Deleting checkpoint doesn't affect running clones",
      ],
    },
    {
      number: "04",
      icon: GitCommit,
      title: "Revision Gating",
      color: "text-amber-400",
      border: "border-amber-500/20 bg-amber-500/5",
      badge: "Evolution",
      principles: [
        "Gate new claims on UPDATEDAVAILABLEREPLICAS reaching target",
        "Use lifecycle hooks (PreUpgrade) to preserve filesystem",
        "Combine PreUpgrade hooks + Checkpoints to preserve filesystem state across active session recreates",
        "Track per-sandbox updateRevision for canary analysis",
      ],
    },
  ];

  return (
    <SlideLayout
      heading="Four Reusable Control-Loop Patterns"
      subheading="These patterns apply beyond OpenKruise — they're blueprints for any Kubernetes-native agentic platform"
      badge="Takeaways"
    >
      <div className="grid grid-cols-4 gap-4 h-full">
        {patterns.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.number} className={`border ${p.border}`}>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-black text-border/50 font-mono">{p.number}</span>
                  <div className={`p-1.5 rounded-lg bg-muted/60 ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit text-xs mb-2">{p.badge}</Badge>
                <h3 className={`font-bold text-sm mb-3 ${p.color}`}>{p.title}</h3>
                <ul className="space-y-1.5 flex-1">
                  {p.principles.map((point, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-border shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SlideLayout>
  );
}
