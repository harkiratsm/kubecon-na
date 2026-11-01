import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Box, Network, ListChecks } from "lucide-react";

export function Slide11ReconcileStorms() {
  const layers = [
    {
      icon: Box,
      title: "One Pod, one session",
      body: "Each sandbox is its own Pod, so it gets its own PID, mount, and network namespace. A shell in one session cannot see another session’s processes or files.",
    },
    {
      icon: Shield,
      title: "seccomp on the template",
      body: "Set RuntimeDefault and allowPrivilegeEscalation: false on the MCP server container in the SandboxSet. Every warm Pod is born with that profile. The controller does not add it for you.",
    },
    {
      icon: Network,
      title: "Egress is an allowlist",
      body: "TrafficPolicy says which hosts a sandbox may reach. A cluster-wide GlobalTrafficPolicy can block metadata addresses even if a tenant forgets.",
    },
    {
      icon: ListChecks,
      title: "MCP tools are an allowlist",
      body: "SecurityProfile.mcpToolPolicy matches tools/call by name. defaultAction: deny means an unnamed tool does not run. tools/list still passes through.",
    },
  ];

  return (
    <SlideLayout
      heading="Isolation is four separate controls"
      subheading="A Pod boundary stops a shared process. Policy decides what that process may still do."
      badge="Isolation"
    >
      <div className="grid grid-cols-2 gap-3 h-full">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <Card key={layer.title} className="border-[#DDE3F0]">
              <CardContent className="p-4 flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-[#3939D9]/10 text-[#3939D9] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#00144C] mb-1">{layer.title}</h3>
                  <p className="text-sm text-[#305BA9] leading-relaxed">{layer.body}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[#305BA9] text-center">
        These are Linux namespaces on the Pod, not a Kubernetes Namespace per user. A SandboxSet’s sandboxes share its namespace.
      </p>
    </SlideLayout>
  );
}
