import { SlideLayout } from "@/components/SlideLayout";
import { ComparisonTable } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent } from "@/components/ui/card";
import { Pause, Camera } from "lucide-react";

export function Slide12PauseVsCheckpoint() {
  const rows = [
    ["Effect on source", "Paused — Pod stops", "Briefly paused, then resumes (keepRunning: true by default)"],
    ["Relationship", "1:1 — same sandbox ID restored", "1:many — one checkpoint → many cloned sandboxes"],
    ["Sandbox ID after", "Unchanged — same identity", "Source unchanged; each clone gets a new ID"],
    ["State preserved", "Platform-dependent (memory optional)", "memory + filesystem (both by default)"],
    ["Typical use", "Suspend idle session, resume later", "Rollback, fork state, disaster recovery"],
    ["Access style", "E2B pause()/betaPause() or spec.paused", "Checkpoint CRD or E2B createSnapshot()"],
  ];

  return (
    <SlideLayout
      heading="Pause vs Checkpoint"
      subheading="Both capture sandbox state — but they answer very different questions"
      badge="Checkpoint"
    >
      <div className="space-y-4">
        <TwoColumn
          ratio="1:1"
          left={
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4 flex gap-3 items-start">
                <Pause className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Pause / Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Think of it like <strong className="text-amber-400">hibernating a laptop</strong>. The same session wakes up exactly where it left off. One-to-one.
                  </p>
                </div>
              </CardContent>
            </Card>
          }
          right={
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex gap-3 items-start">
                <Camera className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Checkpoint (Snapshot)</h3>
                  <p className="text-sm text-muted-foreground">
                    Think of it like <strong className="text-primary">cloning a VM from a snapshot</strong>. The original keeps running; you fork as many copies as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        />
        <ComparisonTable
          headers={["Dimension", "Pause / Resume", "Checkpoint"]}
          rows={rows}
        />
      </div>
    </SlideLayout>
  );
}
