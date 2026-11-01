import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Server, FolderOpen, Terminal } from "lucide-react";

export function Slide02AgentWorkload() {
  const pieces = [
    {
      title: "The agent",
      desc: "An LLM app that decides the next step. It does not run the tool itself — it asks an MCP server to.",
      icon: Bot,
    },
    {
      title: "The MCP server",
      desc: "A long-running process that exposes tools: read a file, run a shell command, call the network.",
      icon: Server,
    },
    {
      title: "The session",
      desc: "One user, one server, for minutes. Files, packages, and shell history are the session’s state.",
      icon: FolderOpen,
    },
    {
      title: "The risk",
      desc: "That process can touch the filesystem, spawn processes, and open sockets. It must not be shared.",
      icon: Terminal,
    },
  ];

  return (
    <SlideLayout
      heading="What we mean by an MCP server"
      subheading="Model Context Protocol is how an agent reaches tools. The server is the thing you have to run."
      badge="Context"
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        {pieces.map((w) => {
          const Icon = w.icon;
          return (
            <Card key={w.title} className="flex flex-col border-[#DDE3F0]">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="mt-0.5 p-2 rounded-lg bg-[#3939D9]/10 text-[#3939D9]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#00144C] mb-1">{w.title}</h3>
                  <p className="text-sm text-[#305BA9] leading-relaxed">{w.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-[#3939D9]/8 border border-[#3939D9]/20">
        <p className="text-sm text-[#00144C] font-medium text-center">
          This talk is about the infrastructure under that server — not a new MCP protocol.
        </p>
      </div>
    </SlideLayout>
  );
}
