import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, ArrowRight } from "lucide-react";

export function Slide16ClonePath() {
  const claimYaml = `apiVersion: agents.kruise.io/v1alpha1
kind: SandboxClaim
metadata:
  name: resume-from-checkpoint
  namespace: default
spec:
  # When a Checkpoint with this name exists,
  # the controller takes the clone path
  # instead of the warm-pool path
  templateName: checkpoint-session-01`;

  const e2bCode = `from e2b_code_interpreter import Sandbox

# Original work
sbx = Sandbox.create(template="demo")
snap = sbx.create_snapshot()

# Fork from checkpoint — new sandbox ID,
# same memory + filesystem state
restored = Sandbox.create(
    template=snap.snapshot_id
)
# Continues right where the snapshot left off`;

  return (
    <SlideLayout
      heading="Rehydration — Clone Path"
      subheading="SandboxClaim automatically routes to clone path when templateName resolves to a Checkpoint"
      badge="Rehydration"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">templateName resolves to</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent">SandboxSet</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Warm pool path (sub-second)</span>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">templateName resolves to</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary">Checkpoint</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clone path (restore state)</span>
            </div>
          </div>
        </div>

        <TwoColumn
          ratio="1:1"
          left={
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Via CRD</p>
              <CodeBlock code={claimYaml} language="yaml" compact />
            </div>
          }
          right={
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Via E2B SDK</p>
              <CodeBlock code={e2bCode} language="python" compact />
            </div>
          }
        />

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 flex gap-3 items-center">
            <GitBranch className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">One checkpoint → unlimited clones.</span>{" "}
              Each clone gets a new Sandbox ID. The original checkpoint is read-only and unaffected.
              Deleting the checkpoint does not affect already-running clones.
            </p>
          </CardContent>
        </Card>
      </div>
    </SlideLayout>
  );
}
