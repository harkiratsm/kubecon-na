import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Terminal, RotateCcw, FlaskConical } from "lucide-react";

export function Slide02AgentWorkload() {
  const workloadTypes = [
    {
      title: "Tool-Use Sandboxes",
      desc: "Isolated environments for AI agents using diverse tools — code execution, browser, file I/O",
      icon: Wrench,
      color: "text-primary",
    },
    {
      title: "Cloud Dev Environments",
      desc: "Network-accessible, persistent workspaces for research notebooks and development sessions",
      icon: Terminal,
      color: "text-accent",
    },
    {
      title: "RL Training Jobs",
      desc: "Reinforcement learning with human-in-the-loop and open-world training feedback loops",
      icon: RotateCcw,
      color: "text-emerald-400",
    },
    {
      title: "Big Data Training",
      desc: "Jobs requiring rapid startup times, robust fault tolerance, and stateful restarts",
      icon: FlaskConical,
      color: "text-amber-400",
    },
  ];

  return (
    <SlideLayout
      heading="What is an Agentic Workload?"
      subheading="The four categories OpenKruise Agents is designed to serve"
      badge="Context"
    >
      <div className="grid grid-cols-2 gap-4 h-full">
        {workloadTypes.map((w) => {
          const Icon = w.icon;
          return (
            <Card key={w.title} className="flex flex-col border-border/60 hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className={`mt-0.5 p-2 rounded-lg bg-muted/60 ${w.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-primary font-medium text-center">
          Common thread: short-lived, stateful, high-frequency sandbox sessions — each needing fast startup and safe teardown
        </p>
      </div>
    </SlideLayout>
  );
}
