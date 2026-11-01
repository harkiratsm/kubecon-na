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
  templateName: mcp-tools  # SandboxSet name`;

  const batchYaml = `spec:
  templateName: mcp-tools
  replicas: 10       # batch claim
  claimTimeout: 1m   # max time for entire claim task
  ttlAfterCompleted: 5m  # auto-GC claim CR (not sandboxes)`;

  const postProcessing = [
    { label: "Per-user volume", desc: "dynamicVolumesMount attaches that user’s data after the claim. Requires the csi runtime on the SandboxSet." },
    { label: "Do not change the image here", desc: "An in-place image update pulls after the claim and gives up the 100ms path. Put the MCP image in the pool." },
    { label: "CPU / memory resize", desc: "In-place resize of the main container. Memory can only go up. Needs Kubernetes in-place Pod resize (1.33+, or 1.27–1.32 with the feature gate)." },
    { label: "Labels for the session", desc: "Labels land on the Sandbox and the Pod. Annotations land on the Sandbox only." },
  ];

  return (
    <SlideLayout
      heading="SandboxClaim binds the session"
      subheading="A claim takes a warm server off the shelf. Customization happens after the bind."
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
                Warm pool in stock → sub-second bind (abstract target: under 100ms). Empty pool waits for the next Pod. Image changes and volume mounts are extra, after the bind.
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
