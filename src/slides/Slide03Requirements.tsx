import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Database, RefreshCw } from "lucide-react";

export function Slide03Requirements() {
  const requirements = [
    {
      number: "01",
      icon: Zap,
      title: "Fast Startup",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      points: [
        "Users expect instant or near-instant sandbox sessions",
        "AI orchestrators spawn many sandboxes per task iteration",
        "Cold Pod start overhead is 10s–minutes — unacceptable at scale",
      ],
    },
    {
      number: "02",
      icon: Database,
      title: "Reliable State Preservation",
      color: "text-accent",
      bgColor: "bg-accent/10 border-accent/20",
      points: [
        "Retries must not duplicate or lose in-flight agent work",
        "Memory, filesystem, GPU memory all need to survive failures",
        "State must be portable across nodes for scheduling flexibility",
      ],
    },
    {
      number: "03",
      icon: RefreshCw,
      title: "Safe Runtime Evolution",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
      points: [
        "Update sandbox images / deps without killing active sessions",
        "Control which sessions get upgraded and when",
        "Roll back quickly if new runtime causes regressions",
      ],
    },
  ];

  return (
    <SlideLayout
      heading="Three Hard Requirements"
      subheading="What production agentic workloads actually demand from infrastructure"
      badge="Problem Space"
    >
      <div className="grid grid-cols-3 gap-5 h-full">
        {requirements.map((req) => {
          const Icon = req.icon;
          return (
            <Card key={req.number} className={`border ${req.bgColor} bg-opacity-20`}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-black text-border/50 font-mono">{req.number}</span>
                  <div className={`p-2 rounded-lg bg-muted/60 ${req.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-3 ${req.color}`}>{req.title}</h3>
                <ul className="space-y-2 flex-1">
                  {req.points.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-border shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SlideLayout>
  );
}
