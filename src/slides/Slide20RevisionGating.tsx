import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function Slide20RevisionGating() {
  const statusCode = `# Monitor rolling update progress
kubectl get sbs my-pool -o wide

NAME      REPLICAS  AVAILABLE  UPDATEDREPLICAS  UPDATEDAVAILABLEREPLICAS  UPDATEREVISION  AGE
my-pool   10        8          6                5                          a1b2c3d4        30m

# Complete when UPDATEDAVAILABLEREPLICAS == REPLICAS`;

  const lifecycleCode = `# SandboxUpdateOps lifecycle phases:
# 1. PreUpgrade — backup state before pod deleted
preUpgrade:
  exec:
    command:
      - tar czf /mnt/backup-$(hostname).tar.gz
            -C /home/user/workspace .

# 2. UpgradePod — delete old, create new pod

# 3. PostUpgrade — restore state after new pod ready
postUpgrade:
  exec:
    command:
      - tar xzf /mnt/backup-$(hostname).tar.gz
            -C /home/user/workspace`;

  return (
    <SlideLayout
      heading="Don’t hand out the old server"
      subheading="New claims should wait until the warm pool is actually on the new MCP image"
      badge="Upgrades"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Pool revision tracking</p>
            <CodeBlock code={statusCode} language="shell" compact />
            <div className="space-y-2 text-xs">
              {[
                ["UPDATEREVISION", "Hash of current desired template"],
                ["UPDATEDREPLICAS", "Sandboxes on new revision"],
                ["UPDATEDAVAILABLEREPLICAS", "New-revision sandboxes ready to claim"],
              ].map(([field, desc]) => (
                <div key={field} className="flex gap-2 items-start p-2 rounded-md bg-muted/30 border border-border/40">
                  <span className="font-mono text-primary text-xs shrink-0">{field}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        }
        right={
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Active session upgrade lifecycle</p>
            <CodeBlock code={lifecycleCode} language="yaml" compact />
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Pattern:</span> Use PreUpgrade + CSI mounts to backup workspace to external storage. PostUpgrade restores it. Memory/IP are lost but filesystem work survives.
                </p>
              </CardContent>
            </Card>
          </div>
        }
      />
    </SlideLayout>
  );
}
