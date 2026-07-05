import { SlideLayout } from "@/components/SlideLayout";
import { ComparisonTable } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Camera } from "lucide-react";

export function Slide15TemplateVsCheckpoint() {
  const rows = [
    ["Defined by", "Declarative CRD + container image", "Capturing a running sandbox's live state"],
    ["Reproducibility", "Same definition → same sandbox every time", "Captures whatever runtime state exists"],
    ["Best for", "Base environments, warm pools, pre-warmed images", "Fork, rollback, retry with in-flight state"],
    ["Can seed warm pool", "Yes — SandboxSet is the warm pool", "No — use as clone source via SandboxClaim.templateName"],
    ["SandboxTemplate immutability", "SandboxTemplate CR is immutable; SandboxSet.spec.template is editable and creates new SandboxTemplate revisions", "Immutable — snapshot in time"],
    ["GC policy", "Lives until SandboxSet is deleted", "ttlAfterFinished + manual delete"],
  ];

  return (
    <SlideLayout
      heading="Template vs Checkpoint"
      subheading="Both provide reusable starting points — they solve different problems"
      badge="Checkpoint"
    >
      <div className="space-y-4">
        <TwoColumn
          left={
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 flex gap-3 items-start">
                <Layers className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">SandboxTemplate / SandboxSet</h3>
                  <p className="text-sm text-muted-foreground">
                    Use when every sandbox should start from an <strong className="text-accent">identical, pre-provisioned base</strong>.
                    Perfect for warm pools because it's declarative and reproducible.
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
                  <h3 className="font-semibold text-foreground mb-1">Checkpoint</h3>
                  <p className="text-sm text-muted-foreground">
                    Use when you need to <strong className="text-primary">capture or fork live runtime state</strong> that depends on what actually happened during execution — installed packages, computed state, open files.
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        />
        <ComparisonTable
          headers={["Dimension", "Template / SandboxSet", "Checkpoint"]}
          rows={rows}
        />
      </div>
    </SlideLayout>
  );
}
