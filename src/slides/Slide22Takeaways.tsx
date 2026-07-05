import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, Database, RefreshCw, ExternalLink } from "lucide-react";

export function Slide22Takeaways() {
  const takeaways = [
    {
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      title: "Cut Cold Starts with Warm Pools",
      desc: "SandboxSet pre-creates ready replicas. Claims return in sub-second. Pool auto-replenishes after every claim — no manual intervention needed.",
    },
    {
      icon: Database,
      color: "text-accent",
      bg: "bg-accent/10 border-accent/20",
      title: "Preserve Agent Work with Checkpoints",
      desc: "Checkpoint CRD captures memory + filesystem at any milestone. One checkpoint clones into unlimited independent sandboxes. Node failures become fast recoveries, not full restarts.",
    },
    {
      icon: RefreshCw,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      title: "Evolve Runtime Without Chaos",
      desc: "Pool rolling updates target only idle sandboxes. SandboxUpdateOps upgrades active sessions with lifecycle hooks. updateRevision hash tracks exactly who is on what version.",
    },
  ];

  const links = [
    { label: "GitHub", url: "github.com/openkruise/agents", icon: "⑆" },
    { label: "Docs", url: "openkruise.io/kruiseagents", icon: "⑇" },
    { label: "Slack", url: "#openkruise (Kubernetes Slack)", icon: "⑈" },
    { label: "CNCF", url: "cncf.io (OpenKruise project page)", icon: "⑉" },
  ];

  return (
    <div className="h-full flex flex-col px-12 py-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 text-xs tracking-wider uppercase">Takeaways</Badge>
          <h1 className="text-3xl font-bold text-foreground">Key Takeaways</h1>
          <p className="text-muted-foreground mt-1">What you can apply to your own platform this week</p>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1">
          {takeaways.map((t, i) => {
            const Icon = t.icon;
            return (
              <Card key={i} className={`border ${t.bg}`}>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className={`p-2 rounded-lg bg-muted/60 w-fit mb-3 ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-sm mb-2 ${t.color}`}>{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-5" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Find OpenKruise Agents</p>
            <div className="flex items-center gap-3">
              {links.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <ExternalLink className="w-3 h-3" />
                  <span className="font-mono">{l.url}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Session</p>
              <p className="font-mono text-sm font-bold text-primary">29 Jul · 5F/501</p>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-xs text-muted-foreground">Questions?</p>
              <p className="font-semibold text-sm text-foreground">Ask now!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
