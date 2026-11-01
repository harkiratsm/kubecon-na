import { SlideLayout } from "@/components/SlideLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Lock } from "lucide-react";

export function Slide03Requirements() {
  const requirements = [
    {
      number: "01",
      icon: Shield,
      title: "Isolate every user",
      points: [
        "One person’s shell must not see another person’s files",
        "A crashed or hostile tool call stays inside that session",
        "Sharing one MCP process across users is the failure mode",
      ],
    },
    {
      number: "02",
      icon: Zap,
      title: "No cold start at scale",
      points: [
        "Thousands of sessions, each wanting a server now",
        "Schedule, image pull, and boot cannot sit on the request path",
        "A warm sandbox should bind in under 100ms",
      ],
    },
    {
      number: "03",
      icon: Lock,
      title: "Expose tools on purpose",
      points: [
        "Filesystem, shell, and network are the product",
        "They are also the attack surface",
        "Allow what the session needs. Deny the rest.",
      ],
    },
  ];

  return (
    <SlideLayout
      heading="Three questions production forces on you"
      subheading="MCP is easy to demo. Running the server for every user is the hard part."
      badge="Problem"
    >
      <div className="grid grid-cols-3 gap-5 h-full">
        {requirements.map((req) => {
          const Icon = req.icon;
          return (
            <Card key={req.number} className="border border-[#3939D9]/20 bg-[#3939D9]/5">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-black text-[#3939D9]/25 font-mono">{req.number}</span>
                  <div className="p-2 rounded-lg bg-white text-[#3939D9]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#00144C]">{req.title}</h3>
                <ul className="space-y-2 flex-1">
                  {req.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-[#305BA9]">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#3939D9] shrink-0" />
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
