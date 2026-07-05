import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowRight } from "lucide-react";

export function Slide04NaiveK8sFails() {
  const failures = [
    {
      label: "Cold Start Every Request",
      naive: "Pod schedule → image pull → container init → sandbox boot",
      result: "10 seconds to several minutes of latency per agent session",
      metric: "10s – 3min",
    },
    {
      label: "Retry = New Pod = Lost State",
      naive: "Any node failure or preemption recreates the Pod from scratch",
      result: "In-memory agent state (installed packages, execution context) is gone",
      metric: "0% recovery",
    },
    {
      label: "Rolling Update Kills Sessions",
      naive: "Standard RollingUpdate replaces Pods that may have active agent sessions",
      result: "Users mid-session are forcibly evicted; no graceful state handoff",
      metric: "Broken UX",
    },
  ];

  return (
    <SlideLayout
      heading="Why Naive Kubernetes Fails Here"
      subheading="Standard primitives (Deployment, RollingUpdate) were not designed for stateful, short-lived sessions"
      badge="Problem"
    >
      <div className="space-y-4">
        {failures.map((f, i) => (
          <Card key={i} className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-4">
              <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.label}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium text-foreground/70">Naive path: </span>
                      {f.naive}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/70">Result: </span>
                      {f.result}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-1">
                    {f.metric}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="text-muted-foreground text-sm">We need</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            Warm pools
            <ArrowRight className="w-3 h-3" />
            Checkpoint / restore
            <ArrowRight className="w-3 h-3" />
            Revision-gated upgrades
          </span>
        </div>
      </div>
    </SlideLayout>
  );
}
