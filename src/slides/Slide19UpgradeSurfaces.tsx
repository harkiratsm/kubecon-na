import { SlideLayout, ComparisonTable } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";

export function Slide19UpgradeSurfaces() {
  const poolUpgradeYaml = `# Update pool sandboxes — edit spec.template then apply
# (edit your SandboxSet YAML and kubectl apply)
kubectl apply -f sandboxset.yaml

# Controller detects template change, rolls out pool-only
# Old-revision idle sandboxes replaced in batches
# Claimed/active sandboxes are NOT touched`;

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
          image: my-registry/sandbox:v2`;

  const rows = [
    ["Target", "Idle pool sandboxes (SandboxSet)", "Active claimed sandboxes"],
    ["Mechanism", "Rolling update on template change", "SandboxUpdateOps — batch recreate"],
    ["Session impact", "Zero — only unclaimed sandboxes", "Brief outage per sandbox (Pod recreated)"],
    ["Memory / IP", "Lost for replaced pool sandboxes (new Pod, new IP); active sessions unaffected", "Lost — new Pod, new IP"],
    ["Lifecycle hooks", "Not applicable", "PreUpgrade → UpgradePod → PostUpgrade"],
  ];

  return (
    <SlideLayout
      heading="Two Upgrade Surfaces"
      subheading="Idle pool and active sessions require different strategies — the system handles both"
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
                Old-revision idle sandboxes are replaced first. New claims always get latest revision.
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
              <p className="text-xs text-amber-400 font-medium">
                ⚠ Only one active SandboxUpdateOps per namespace at a time. Requires agent-runtime + CSI runtimes for lifecycle hooks. Available since v0.3.0.
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
