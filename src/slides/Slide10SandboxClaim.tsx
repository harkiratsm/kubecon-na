import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Slide10SandboxClaim() {
  const simpleYaml = `apiVersion: agents.kruise.io/v1alpha1
kind: SandboxClaim
metadata:
  name: my-claim
  namespace: default
spec:
  templateName: demo  # SandboxSet name`;

  const batchYaml = `spec:
  templateName: demo
  replicas: 10       # batch claim
  claimTimeout: 1m   # max time for entire claim task
  ttlAfterCompleted: 5m  # auto-GC claim CR (not sandboxes)`;

  const postProcessing = [
    { label: "In-place image upgrade", desc: "Upgrade pool sandbox to requested image — note: breaks sub-second delivery; image pull happens post-claim" },
    { label: "CPU resize", desc: "In-place CPU resize on the running Pod. Memory resize is not supported." },
    { label: "Dynamic PVC mount", desc: "CSI runtime attaches per-session volumes after claim" },
    { label: "Metadata injection", desc: "Labels and annotations added to Sandbox + Pod at claim time" },
  ];

  return (
    <SlideLayout
      heading="SandboxClaim — Declarative Claiming"
      subheading="Request sandboxes from the pool with a simple CRD — supports single, batch, and post-claim customization"
      badge="SandboxClaim"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Single claim</p>
            <CodeBlock code={simpleYaml} language="yaml" compact />
            <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">
                Pool sandbox → <span className="font-mono">sub-second</span> · No pool → waits for replenishment
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground mt-2">Batch claim</p>
            <CodeBlock code={batchYaml} language="yaml" compact />
            <p className="text-xs text-muted-foreground">
              Best-effort gradual delivery. Use label <span className="font-mono">agents.kruise.io/claim-name</span> to watch progress in real-time.
            </p>
          </div>
        }
        right={
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Post-claim processing</p>
            <p className="text-xs text-muted-foreground mb-2">
              After a sandbox is claimed, the controller applies per-session customizations before handing it to the requester:
            </p>
            {postProcessing.map((item) => (
              <Card key={item.label} className="border-border/50">
                <CardContent className="p-3 flex gap-3 items-start">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border/40">
              <Badge variant="secondary" className="text-xs font-mono">sbc</Badge>
              <span className="text-xs text-muted-foreground">Short name: <span className="font-mono">kubectl get sbc</span></span>
            </div>
          </div>
        }
      />
    </SlideLayout>
  );
}
