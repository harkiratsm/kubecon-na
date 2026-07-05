import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

export function Slide18FailureStory() {
  const timeline = [
    {
      time: "T+0",
      event: "Agent session starts",
      detail: "Claimed from warm pool. Sub-second delivery. Agent installs packages, writes 50MB of intermediate data.",
      status: "normal",
    },
    {
      time: "T+5 min",
      event: "Mid-task checkpoint taken",
      detail: "createSnapshot() captures memory + filesystem. Agent continues running. ttlAfterFinished: 24h",
      status: "checkpoint",
    },
    {
      time: "T+12 min",
      event: "Node failure / preemption",
      detail: "Kubernetes evicts the Pod. Without checkpoint: all work is lost. Agent would need to restart from scratch.",
      status: "failure",
    },
    {
      time: "T+12.5 min",
      event: "SandboxClaim from checkpoint",
      detail: "templateName: checkpoint-session-01. sandbox-manager clones from snapshot. New Pod, same state.",
      status: "recovery",
    },
    {
      time: "T+13 min",
      event: "Agent continues",
      detail: "Restored sandbox has all installed packages + intermediate data intact. No duplicated side effects. Task resumes from checkpoint.",
      status: "success",
    },
  ];

  const statusStyles: Record<string, string> = {
    normal: "border-border/40 bg-muted/20",
    checkpoint: "border-primary/30 bg-primary/5",
    failure: "border-destructive/30 bg-destructive/5",
    recovery: "border-amber-500/30 bg-amber-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  };

  const timeColors: Record<string, string> = {
    normal: "text-muted-foreground",
    checkpoint: "text-primary",
    failure: "text-destructive",
    recovery: "text-amber-400",
    success: "text-emerald-400",
  };

  return (
    <SlideLayout
      heading="Failure & Recovery — Concrete Scenario"
      subheading="How checkpoints turn a catastrophic node failure into a fast recovery — no full restart needed"
      badge="Rehydration"
    >
      <div className="space-y-2 overflow-y-auto">
        {timeline.map((item, i) => (
          <Card key={i} className={`border ${statusStyles[item.status]}`}>
            <CardContent className="p-3 flex gap-4 items-start">
              <div className={`font-mono text-xs font-bold shrink-0 w-14 pt-0.5 ${timeColors[item.status]}`}>
                {item.time}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{item.event}</span>
                  {item.status === "checkpoint" && <Badge variant="default" className="text-xs">Checkpoint</Badge>}
                  {item.status === "failure" && <Badge variant="destructive" className="text-xs">Node Failure</Badge>}
                  {item.status === "recovery" && <Badge variant="warning" className="text-xs">Clone Path</Badge>}
                  {item.status === "success" && <Badge variant="success" className="text-xs">Recovered</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <ArrowDown className="w-3 h-3 text-muted-foreground" />
        <p className="text-xs text-center text-muted-foreground">
          Without checkpoint: full re-run from zero.{" "}
          <span className="text-emerald-400 font-semibold">With checkpoint: fast recovery from exact snapshot state, no duplicated work</span>
        </p>
      </div>
    </SlideLayout>
  );
}
