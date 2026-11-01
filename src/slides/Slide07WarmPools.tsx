import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, CheckCircle, XCircle } from "lucide-react";

export function Slide07WarmPools() {
  return (
    <SlideLayout
      heading="Move boot off the tool-call path"
      subheading="The MCP server image is pulled and the process is up before any user arrives"
      badge="Warm Pool"
    >
      <TwoColumn
        ratio="1:1"
        left={
          <div className="space-y-4 h-full flex flex-col">
            <Card className="border-destructive/20 bg-destructive/5 flex-1">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Cold Start Path</h3>
                </div>
                <ol className="space-y-2">
                  {[
                    "User starts a session",
                    "Scheduler places a Pod",
                    "kubelet pulls the MCP image",
                    "MCP server process boots",
                    "Only then can a tool run",
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center font-mono shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <Clock className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-bold text-destructive">10 seconds → several minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        }
        right={
          <div className="space-y-4 h-full flex flex-col">
            <Card className="border-emerald-500/20 bg-emerald-500/5 flex-1">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-foreground">Warm Pool Path</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  SandboxSet keeps replicas in <span className="font-mono text-emerald-700 font-semibold">available</span> before any session exists. Image pull and process start already happened.
                </p>
                <ol className="space-y-2">
                  {[
                    "User starts a session",
                    "Bind an available sandbox",
                    "MCP server is already listening",
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center gap-2 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-700">Bind in under 100ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
      <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/40 text-center text-sm text-muted-foreground">
        The pool absorbs the burst. Replenishment — schedule, pull, boot — happens in the background, off the user’s path.
      </div>
    </SlideLayout>
  );
}
