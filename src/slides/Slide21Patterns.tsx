import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowLeftRight, Camera, GitCommit } from "lucide-react";

export function Slide21Patterns() {
  const patterns = [
    {
      number: "01",
      icon: Layers,
      title: "Warm MCP servers",
      color: "text-primary",
      border: "border-primary/20 bg-primary/5",
      badge: "Startup",
      principles: [
        "Keep availableReplicas above the burst you actually see",
        "Alert when the warm MCP servers hit zero",
        "replicas does not include sessions already claimed",
        "Scale the pool down when the agents go quiet",
      ],
    },
    {
      number: "02",
      icon: ArrowLeftRight,
      title: "Bind, don’t boot",
      color: "text-accent",
      border: "border-accent/20 bg-accent/5",
      badge: "Scale",
      principles: [
        "A warm claim is the under-100ms path",
        "Mount volumes and change images after the bind, and budget for them",
        "Set claimTimeout so an empty pool cannot hang forever",
        "One SandboxClaim per user. Never reuse a live server.",
      ],
    },
    {
      number: "03",
      icon: Camera,
      title: "Save tool state",
      color: "text-emerald-400",
      border: "border-emerald-500/20 bg-emerald-500/5",
      badge: "Reliability",
      principles: [
        "Snapshot before the user leaves, and before an upgrade",
        "persistentContents: memory and filesystem",
        "The E2B snapshot id is the Checkpoint name",
        "Give checkpoints a TTL so they do not pile up",
      ],
    },
    {
      number: "04",
      icon: GitCommit,
      title: "Hand off upgrades",
      color: "text-amber-400",
      border: "border-amber-500/20 bg-amber-500/5",
      badge: "Evolution",
      principles: [
        "Roll the idle pool by editing SandboxSet.spec.template",
        "Leave claimed sessions alone until you checkpoint them",
        "SandboxUpdateOps recreates a live Pod. Restore from the checkpoint.",
        "Serve new sessions only after the warm pool is on the new image",
      ],
    },
  ];

  return (
    <SlideLayout
      heading="What to take back to your cluster"
      subheading="Four patterns. None of them require you to rebuild Kubernetes."
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
