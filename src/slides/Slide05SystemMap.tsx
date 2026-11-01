import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Route, Cpu, Activity, GitBranch } from "lucide-react";

export function Slide05SystemMap() {
  const components = [
    {
      name: "sandbox-controller",
      icon: GitBranch,
      role: "Control plane",
      desc: "Reconciles SandboxSet, SandboxClaim, Checkpoint, and policy CRDs. Runs admission webhooks.",
    },
    {
      name: "sandbox-manager",
      icon: Server,
      role: "Lifecycle API",
      desc: "Stateless E2B-compatible lifecycle API. Creates, pauses, resumes, snapshots. It is not the MCP tool server.",
    },
    {
      name: "sandbox-gateway",
      icon: Route,
      role: "Data plane",
      desc: "Envoy filters. Ingress reaches the claimed sandbox. Egress applies TrafficPolicy and MCP tool ACL.",
    },
    {
      name: "agent-runtime + csi",
      icon: Activity,
      role: "Sidecars",
      desc: "agent-runtime: command/file ops on port 49983. Separate csi runtime: on-demand PV mounts for per-user data.",
    },
    {
      name: "Sandbox Pod",
      icon: Cpu,
      role: "The MCP server",
      desc: "Your MCP server image. One Pod per session: its own PID, mount, and network namespace.",
    },
  ];

  return (
    <SlideLayout
      heading="OpenKruise Agents runs the server, it does not replace it"
      subheading="Your MCP server stays your code. The project supplies the pool, the claim, and the guardrails."
      badge="Architecture"
    >
      <div className="grid grid-cols-5 gap-3">
        {components.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.name} className="border-[#DDE3F0]">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-2 rounded-lg bg-[#3939D9]/10 text-[#3939D9]">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="text-xs">{c.role}</Badge>
                <h3 className="font-mono text-xs font-bold text-[#00144C] leading-tight">{c.name}</h3>
                <p className="text-xs text-[#305BA9] leading-relaxed">{c.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-[#F5F7FC] border border-[#DDE3F0] text-center">
        <p className="text-sm text-[#305BA9]">
          <span className="font-semibold text-[#00144C]">CNCF project · Kubernetes ≥ 1.28 (≥ 1.29 with agent-runtime).</span>{" "}
          Platform teams use CRDs. Agent apps claim a sandbox, then speak MCP to the process inside it.
        </p>
      </div>
    </SlideLayout>
  );
}
