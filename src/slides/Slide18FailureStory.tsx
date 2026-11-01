import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Slide18FailureStory() {
  const timeline = [
    {
      time: "T+0",
      event: "Alice opens a session",
      detail: "SandboxClaim binds a warm MCP server in under 100ms. Her home volume mounts at /home/alice. She installs a package and writes files.",
      status: "normal",
    },
    {
      time: "T+8 min",
      event: "Checkpoint before she leaves",
      detail: "create_snapshot() writes memory and filesystem. The server keeps running. The Checkpoint name is alice-tools-01.",
      status: "checkpoint",
    },
    {
      time: "T+20 min",
      event: "The node is gone",
      detail: "The Pod is evicted. Without the checkpoint, the package install and the shell state are gone with it.",
      status: "failure",
    },
    {
      time: "T+20 min",
      event: "She comes back",
      detail: "A new SandboxClaim sets templateName to alice-tools-01. That is a clone, not a blank server from the pool.",
      status: "recovery",
    },
    {
      time: "T+21 min",
      event: "The tools are where she left them",
      detail: "New Pod, new sandbox id, same files and memory. The next MCP tool call does not repeat the work.",
      status: "success",
    },
  ];

  const statusStyles: Record<string, string> = {
    normal: "border-[#DDE3F0] bg-[#F5F7FC]",
    checkpoint: "border-[#3939D9]/30 bg-[#3939D9]/5",
    failure: "border-[#E63946]/30 bg-[#E63946]/5",
    recovery: "border-amber-600/30 bg-amber-500/5",
    success: "border-emerald-700/30 bg-emerald-500/5",
  };

  return (
    <SlideLayout
      heading="One session, across a dead node"
      subheading="The checkpoint is the handoff. The user does not reinstall, and they do not share a server with anyone else."
      badge="Session"
    >
      <div className="space-y-2">
        {timeline.map((item) => (
          <Card key={item.event} className={`border ${statusStyles[item.status]}`}>
            <CardContent className="p-3 flex gap-4 items-start">
              <div className="font-mono text-xs font-bold shrink-0 w-16 pt-0.5 text-[#3939D9]">
                {item.time}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#00144C]">{item.event}</span>
                  {item.status === "checkpoint" && <Badge variant="secondary" className="text-xs">Checkpoint</Badge>}
                  {item.status === "failure" && <Badge variant="destructive" className="text-xs">Node gone</Badge>}
                  {item.status === "success" && <Badge variant="secondary" className="text-xs">Restored</Badge>}
                </div>
                <p className="text-xs text-[#305BA9]">{item.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideLayout>
  );
}
