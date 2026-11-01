import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";

export function Slide06DualAPI() {
  const crdList = [
    "sandboxsets.agents.kruise.io",
    "sandboxclaims.agents.kruise.io",
    "checkpoints.agents.kruise.io",
    "sandboxupdateops.agents.kruise.io",
    "trafficpolicies.agents.kruise.io",
    "securityprofiles.agents.kruise.io",
  ];

  const e2bCode = `from e2b_code_interpreter import Sandbox

# Claim a warm sandbox. The MCP server
# inside it is already running.
sbx = Sandbox.create(template="mcp-tools")

# Later: snapshot tool state.
# snapshot_id is the Checkpoint name.
snap = sbx.create_snapshot()`;

  return (
    <SlideLayout
      heading="Two ways in, one pool"
      subheading="Platform teams declare the pool. The agent app claims a sandbox, then talks MCP to the process inside."
      badge="Architecture"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <Card className="h-full border-[#DDE3F0]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">Platform / GitOps</Badge>
                <CardTitle className="text-base">Kubernetes CRDs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {crdList.map((crd) => (
                <div key={crd} className="flex items-center gap-2 text-xs font-mono p-2 rounded-md bg-[#F5F7FC] border border-[#DDE3F0]">
                  <span className="w-2 h-2 rounded-full bg-[#3939D9] shrink-0" />
                  <span className="text-[#00144C]">{crd}</span>
                </div>
              ))}
              <p className="text-xs text-[#305BA9] pt-2">
                Pool size, claims, checkpoints, upgrades, and the allowlists for network and MCP tools.
              </p>
            </CardContent>
          </Card>
        }
        right={
          <Card className="h-full border-[#DDE3F0]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-xs">Agent app</Badge>
                <CardTitle className="text-base">Claim, then speak MCP</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CodeBlock code={e2bCode} language="python" compact />
              <div className="space-y-2 text-xs text-[#305BA9]">
                <p>
                  <span className="font-semibold text-[#00144C]">Claim</span> uses the E2B-compatible API on sandbox-manager. Same object the CRD controller writes.
                </p>
                <p>
                  <span className="font-semibold text-[#00144C]">Tools</span> are your MCP server in the Pod. The gateway routes the session there. OpenKruise does not implement your tools.
                </p>
              </div>
            </CardContent>
          </Card>
        }
      />
    </SlideLayout>
  );
}
