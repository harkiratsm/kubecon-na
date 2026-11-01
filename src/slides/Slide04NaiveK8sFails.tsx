import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export function Slide04NaiveK8sFails() {
  const failures = [
    {
      label: "One Deployment, many users",
      naive: "A shared MCP server process handles every session",
      result: "Files, env, and child processes leak across users. One bad tool call is everyone’s problem.",
      metric: "No isolation",
    },
    {
      label: "A Pod per request, created cold",
      naive: "Schedule → pull the MCP image → start the server → then run the tool",
      result: "Tens of seconds before the first tool call. At thousands of sessions, the queue never catches up.",
      metric: "10s – minutes",
    },
    {
      label: "Rolling update ends the session",
      naive: "kubectl set image replaces Pods that still have a user inside",
      result: "Shell history, installed packages, and open files disappear. There is no handoff.",
      metric: "Lost state",
    },
  ];

  return (
    <SlideLayout
      heading="A normal Deployment does not answer those questions"
      subheading="Deployments are built for stateless replicas. An MCP session is stateful, isolated, and short-lived."
      badge="Problem"
    >
      <div className="space-y-3">
        {failures.map((f) => (
          <Card key={f.label} className="border-[#E63946]/25 bg-[#E63946]/5">
            <CardContent className="p-4 flex items-start gap-4">
              <XCircle className="w-5 h-5 text-[#E63946] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#00144C]">{f.label}</p>
                    <p className="text-sm text-[#305BA9] mt-1">{f.naive}</p>
                    <p className="text-sm text-[#00144C] mt-1">{f.result}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#E63946] bg-white border border-[#E63946]/30 rounded-md px-2 py-1">
                    {f.metric}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideLayout>
  );
}
