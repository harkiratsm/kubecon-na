import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Slide13CheckpointCRD() {
  const yamlCode = `apiVersion: agents.kruise.io/v1alpha1
kind: Checkpoint
metadata:
  name: alice-tools-01
  namespace: default
spec:
  # Pod to checkpoint
  podName: alice-mcp-28rvn
  # Keep source running after capture
  keepRunning: true
  # Auto-delete after 30 hours
  ttlAfterFinished: 30h
  # What to capture
  persistentContents:
    - memory
    - filesystem`;

  const fields = [
    {
      name: "spec.podName",
      type: "string",
      desc: "Name of the target Pod/Sandbox to capture",
      required: true,
    },
    {
      name: "spec.keepRunning",
      type: "bool",
      desc: "Source Pod stays Running after capture (default: true). false → Pod → Succeeded",
      required: false,
    },
    {
      name: "spec.persistentContents",
      type: "[]string",
      desc: "memory and/or filesystem. Defaults to both when empty",
      required: false,
    },
    {
      name: "spec.ttlAfterFinished",
      type: "duration",
      desc: "Go duration (30m, 24h, 30d). Auto-GC the Checkpoint CR after finish",
      required: false,
    },
    {
      name: "status.phase",
      type: "string",
      desc: "Pending → Creating → Succeeded → (Terminating)",
      required: false,
    },
    {
      name: "status.checkpointId",
      type: "string",
      desc: "Backing driver identifier. Filled once phase = Succeeded",
      required: false,
    },
  ];

  return (
    <SlideLayout
      heading="A checkpoint is the tool state"
      subheading="Memory and filesystem of that MCP server, stored as a Checkpoint object"
      badge="Checkpoint"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <div className="space-y-3">
            <CodeBlock code={yamlCode} language="yaml" />
            <div className="p-2 rounded-md bg-muted/30 border border-border/40">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-primary">$ kubectl get cp</span><br />
                alice-tools-01  <span className="text-emerald-700">Succeeded</span>  24s
              </p>
            </div>
          </div>
        }
        right={
          <div className="space-y-2">
            {fields.map((f) => (
              <Card key={f.name} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-primary">{f.name}</span>
                    <Badge variant="outline" className="text-xs font-mono">{f.type}</Badge>
                    {f.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      />
    </SlideLayout>
  );
}
