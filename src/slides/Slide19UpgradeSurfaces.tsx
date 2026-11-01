import { SlideLayout, ComparisonTable } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";

export function Slide19UpgradeSurfaces() {
  const poolUpgradeYaml = `# Patch the pool template — do NOT full-object Update
# (busy SandboxSets conflict on resourceVersion)
kubectl patch sbs mcp-tools --type merge -p \\
  '{"spec":{"template":{"spec":{"containers":[{
     "name":"sandbox",
     "image":"my-registry/mcp-server:v2"}]}}}}'

# Rolls idle sandboxes only. Claimed sessions are untouched.`;

  const updateOpsYaml = `kind: SandboxUpdateOps
spec:
  selector:
    matchLabels:
      app: my-agent
  updateStrategy:
    maxUnavailable: 2
  patch:
    spec:
      containers:
        - name: sandbox
          image: my-registry/mcp-server:v2`;

  const rows = [
    ["Target", "Idle pool sandboxes (SandboxSet)", "Active claimed sandboxes"],
    ["Mechanism", "Rolling update on template change", "SandboxUpdateOps Recreate (default)"],
    ["Session impact", "None. Only unclaimed servers are replaced.", "Checkpoint first, then recreate the Pod."],
    ["State", "Idle servers have no user state.", "Restore from Checkpoint. New Pod, new IP. CheckpointRestore mode cannot change the MCP image."],
    ["Lifecycle hooks", "Not applicable", "PreUpgrade → recreate → PostUpgrade (needs agent-runtime)"],
  ];

  return (
    <SlideLayout
      heading="Change the MCP server without kicking the user"
      subheading="Idle servers roll with the pool. A live session is checkpointed, then recreated on the new image."
      badge="Upgrades"
    >
      <div className="space-y-4">
        <TwoColumn
          ratio="1:1"
          left={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">Zero-impact</Badge>
                <span className="font-semibold text-sm text-foreground">Pool Rolling Update</span>
              </div>
              <CodeBlock code={poolUpgradeYaml} language="shell" compact />
              <p className="text-xs text-muted-foreground">
                Only idle servers are replaced. Gate new claims until the updated pool is ready — next slide.
              </p>
            </div>
          }
          right={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-xs">Controlled outage</Badge>
                <span className="font-semibold text-sm text-foreground">SandboxUpdateOps</span>
              </div>
              <CodeBlock code={updateOpsYaml} language="yaml" compact />
              <p className="text-xs text-muted-foreground">
                Targets running sessions by label selector. Respects maxUnavailable — upgrade in controlled batches.
              </p>
              <p className="text-xs text-amber-700 font-medium">
                ⚠ One active SandboxUpdateOps per namespace. Hooks need agent-runtime; CSI only if the backup uses a volume. Image change → Recreate, not CheckpointRestore.
              </p>
            </div>
          }
        />
        <ComparisonTable
          headers={["Dimension", "Pool (SandboxSet)", "Active Sessions (SandboxUpdateOps)"]}
          rows={rows}
        />
      </div>
    </SlideLayout>
  );
}
