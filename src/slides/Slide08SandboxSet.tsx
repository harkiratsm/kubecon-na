import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Slide08SandboxSet() {
  const yamlCode = `apiVersion: agents.kruise.io/v1alpha1
kind: SandboxSet
metadata:
  name: demo
  namespace: default
spec:
  # Pool size — slightly larger than burst estimate
  replicas: 10
  # What to persist during hibernate/wake
  persistentContents:
    - ip
  template:
    spec:
      containers:
        - name: sandbox
          image: my-registry/sandbox:v1`;

  const fields = [
    { name: "replicas", desc: "Number of warm sandboxes to maintain (excludes claimed ones)" },
    { name: "persistentContents", desc: "What survives hibernate/wake cycle. Documented value: ip (preserves sandbox IP). Checkpoint uses memory/filesystem separately." },
    { name: "template", desc: "Pod spec used for each warm sandbox (identical to Sandbox CRD)" },
    { name: "updateStrategy.maxUnavailable", desc: "Max unavailable during rolling pool update" },
    { name: "status.availableReplicas", desc: "How many sandboxes are ready to be claimed right now" },
    { name: "status.updateRevision", desc: "Hash of current desired template for revision tracking" },
  ];

  return (
    <SlideLayout
      heading="SandboxSet — The Pool Controller"
      subheading="ReplicaSet for sandboxes — optimized for high-frequency scale and sub-second claiming"
      badge="Warm Pool"
    >
      <TwoColumn
        ratio="1:1"
        left={<CodeBlock code={yamlCode} language="yaml" />}
        right={
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Key fields and semantics:</p>
            {fields.map((f) => (
              <Card key={f.name} className="border-border/50">
                <CardContent className="p-3 flex gap-3">
                  <Badge variant="secondary" className="font-mono text-xs shrink-0 h-fit">{f.name}</Badge>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
            <div className="p-3 mt-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary font-medium">
                Short name: <span className="font-mono">sbs</span> — use <span className="font-mono">kubectl get sbs</span> to monitor pool health
              </p>
            </div>
          </div>
        }
      />
    </SlideLayout>
  );
}
