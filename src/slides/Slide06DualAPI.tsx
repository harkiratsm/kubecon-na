import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";

export function Slide06DualAPI() {
  const crdList = [
    "checkpoints.agents.kruise.io",
    "sandboxclaims.agents.kruise.io",
    "sandboxes.agents.kruise.io",
    "sandboxsets.agents.kruise.io",
    "sandboxtemplates.agents.kruise.io",
    "sandboxupdateops.agents.kruise.io",
  ];

  const e2bCode = `from e2b_code_interpreter import Sandbox

# Uses the same backend as kubectl!
sbx = Sandbox.create(template="demo")
snapshot = sbx.create_snapshot()
print(snapshot.snapshot_id)`;

  return (
    <SlideLayout
      heading="Dual API Surface"
      subheading="Same backend, two consumption styles — choose what fits your team"
      badge="Architecture"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <Card className="h-full border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">Platform / GitOps</Badge>
                <CardTitle className="text-base">Kubernetes CRDs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {crdList.map((crd) => (
                <div key={crd} className="flex items-center gap-2 text-xs font-mono p-2 rounded-md bg-muted/40 border border-border/40">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground/80">{crd}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                Declarative GitOps, RBAC-controlled, kubectl-friendly.
                Target audience: infra teams and platform builders.
              </p>
            </CardContent>
          </Card>
        }
        right={
          <Card className="h-full border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-xs">App Developers</Badge>
                <CardTitle className="text-base">E2B SDK + MCP</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CodeBlock code={e2bCode} language="python" compact />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">E2B-compatible:</span> drop-in replacement for e2b.dev — same Python/JS SDK
                </p>
                <p>
                  <span className="font-semibold text-foreground">MCP API:</span> LLM tool-use via Model Context Protocol
                </p>
                <p>
                  <span className="font-semibold text-foreground">snapshotId == Checkpoint.name</span> — CRD and SDK are synchronized
                </p>
              </div>
            </CardContent>
          </Card>
        }
      />
    </SlideLayout>
  );
}
