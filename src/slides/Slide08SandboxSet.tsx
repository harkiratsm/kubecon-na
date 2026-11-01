import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Slide08SandboxSet() {
  const yamlCode = `apiVersion: agents.kruise.io/v1alpha1
kind: SandboxSet
metadata:
  name: mcp-tools
  namespace: default
spec:
  replicas: 10          # warm, unclaimed servers
  persistentContents:
    - ip
  template:
    spec:
      containers:
        - name: sandbox
          image: my-registry/mcp-server:v1
          securityContext:
            allowPrivilegeEscalation: false
            seccompProfile:
              type: RuntimeDefault`;

  const fields = [
    { name: "replicas", desc: "How many unclaimed MCP servers to keep warm. Claimed sandboxes are not part of this count." },
    { name: "template", desc: "The Pod that runs your MCP server. Put seccomp and the dropped privileges here so every claim inherits them." },
    { name: "persistentContents", desc: "What pause/resume keeps. ip preserves the sandbox IP. Memory and filesystem belong to Checkpoint." },
    { name: "status.availableReplicas", desc: "How many MCP servers can be claimed right now. This is the number to alert on." },
  ];

  return (
    <SlideLayout
      heading="SandboxSet pre-warms the MCP server"
      subheading="A ReplicaSet for sandboxes. replicas is the spare pool, not the number of live sessions."
      badge="Warm Pool"
    >
      <TwoColumn
        ratio="1:1"
        left={<CodeBlock code={yamlCode} language="yaml" compact />}
        right={
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#305BA9] mb-2">Key fields</p>
            {fields.map((f) => (
              <Card key={f.name} className="border-border/50">
                <CardContent className="p-2.5 flex gap-2">
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
