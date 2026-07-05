import { SlideLayout } from "@/components/SlideLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function Slide14CreatingCheckpoints() {
  const kubectlCode = `# Apply the Checkpoint manifest
kubectl apply -f checkpoint.yaml

# Watch progress
kubectl get cp
# NAME                    STATUS     AGE
# checkpoint-session-01   Succeeded  24s

# Checkpoint is ready — use name as template`;

  const e2bPython = `from e2b_code_interpreter import Sandbox

# Create a sandbox, do work
sbx = Sandbox.create(template="demo")
sbx.run_code("import numpy as np; arr = np.arange(100)")

# Snapshot captures live state
snap = sbx.create_snapshot()
print("Checkpoint:", snap.snapshot_id)
# checkpoint-session-01  ← same as Checkpoint.name`;

  const e2bTs = `import { Sandbox } from 'e2b'

const sbx = await Sandbox.create('demo')
await sbx.runCode('const x = computeHeavyThing()')

const snap = await sbx.createSnapshot()
console.log(snap.snapshotId)  // checkpoint-session-01`;

  return (
    <SlideLayout
      heading="Creating Checkpoints — Two Interfaces"
      subheading="CRD for GitOps operators; E2B SDK for application code — both write the same Checkpoint CR"
      badge="Checkpoint"
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        <div className="space-y-3">
          <Badge variant="secondary" className="text-xs">Kubernetes CRD</Badge>
          <CodeBlock code={kubectlCode} language="shell" compact />
          <p className="text-xs text-muted-foreground">
            Ideal for platform teams, GitOps pipelines, and scheduled checkpoint policies.
          </p>
        </div>
        <div className="space-y-3">
          <Badge variant="accent" className="text-xs">E2B Python SDK</Badge>
          <CodeBlock code={e2bPython} language="python" compact />
        </div>
        <div className="space-y-3">
          <Badge variant="default" className="text-xs">E2B TypeScript SDK</Badge>
          <CodeBlock code={e2bTs} language="typescript" compact />
        </div>
      </div>

      <Card className="mt-4 border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-3 flex gap-2 items-start">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-amber-400">Brief pause during capture: </span>
            The source sandbox is momentarily paused while state is written. Active WebSocket, PTY, and command-stream connections are dropped — clients must reconnect after the snapshot returns.
          </p>
        </CardContent>
      </Card>
    </SlideLayout>
  );
}
