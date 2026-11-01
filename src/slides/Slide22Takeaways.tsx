import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Database, ExternalLink } from "lucide-react";

export function Slide22Takeaways() {
  const takeaways = [
    {
      icon: Shield,
      title: "One Pod per user",
      desc: "The MCP server runs inside its own sandbox. Namespaces and seccomp come from the Pod template. TrafficPolicy and mcpToolPolicy decide what it may still call.",
    },
    {
      icon: Zap,
      title: "Bind a warm server",
      desc: "SandboxSet keeps the process up. SandboxClaim hands one to the session in under 100ms, then mounts that user’s volume and warms a replacement.",
    },
    {
      icon: Database,
      title: "Hand off the state",
      desc: "Checkpoint memory and filesystem before a failure or an upgrade. The next claim clones that checkpoint onto a new Pod instead of starting blank.",
    },
  ];

  const links = [
    { label: "GitHub", url: "github.com/openkruise/agents" },
    { label: "Docs", url: "openkruise.io/kruiseagents" },
    { label: "Slack", url: "#openkruise" },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-6">
      <div className="mb-4">
        <Badge variant="secondary" className="mb-2 text-xs tracking-wider uppercase">
          Takeaways
        </Badge>
        <h1 className="text-2xl font-bold text-[#00144C]">Leave with the pattern, not a new platform</h1>
        <p className="text-[#305BA9] mt-1">Pool the server. Isolate the session. Checkpoint before you throw the Pod away.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {takeaways.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.title} className="border border-[#3939D9]/20 bg-[#3939D9]/5 shadow-sm">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="p-2 rounded-lg bg-white w-fit mb-3 text-[#3939D9]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-2 text-[#00144C]">{t.title}</h3>
                <p className="text-sm text-[#305BA9] leading-relaxed">{t.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-4 bg-[#DDE3F0]" />

      <div className="flex items-center justify-between shrink-0 gap-6">
        <div>
          <p className="text-sm font-semibold text-[#00144C] mb-2">OpenKruise Agents</p>
          <div className="flex flex-wrap items-center gap-4">
            {links.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#305BA9]">
                <ExternalLink className="w-3 h-3" />
                <span className="font-mono">{l.url}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[#00144C]">Harkirat Singh · Hrittik Roy</p>
          <p className="text-xs text-[#305BA9] mt-1">12 Nov · 3:30 pm · Salt Lake Ballroom DE</p>
        </div>
      </div>
    </div>
  );
}
