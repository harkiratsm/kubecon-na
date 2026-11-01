import { SlideLayout } from "@/components/SlideLayout";
import { TwoColumn } from "@/components/TwoColumn";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, CardContent } from "@/components/ui/card";

export function Slide14CreatingCheckpoints() {
  const yaml = `apiVersion: agents.kruise.io/v1alpha1
kind: SandboxClaim
metadata:
  name: alice-session
  namespace: default
spec:
  templateName: mcp-tools
  dynamicVolumesMount:
    - pvName: alice-home
      mountPath: /home/alice
    - pvName: shared-docs
      mountPath: /data/docs
      subPath: public
      readOnly: true`;

  const notes = [
    {
      title: "The pool stays generic",
      body: "Warm Pods do not contain anyone’s home directory. The volume is attached when that person claims.",
    },
    {
      title: "Requires the csi runtime",
      body: "SandboxSet.spec must list csi in runtimes (and usually agent-runtime too). The CSI sidecar does the on-demand mount. Without csi, the claim cannot attach the volume.",
    },
    {
      title: "This is not the 100ms path",
      body: "The bind is fast. Publishing the volume happens after it, and it adds latency. Mount only what that session needs.",
    },
    {
      title: "Remount on resume",
      body: "A paused sandbox remounts the same volumes when it wakes, so the user’s files are still there.",
    },
  ];

  return (
    <SlideLayout
      heading="Inject that user’s files at claim time"
      subheading="The warm MCP server is identical for everyone. The volume is what makes it theirs."
      badge="Per-user data"
    >
      <TwoColumn
        ratio="1:1"
        left={<CodeBlock code={yaml} language="yaml" />}
        right={
          <div className="space-y-2">
            {notes.map((n) => (
              <Card key={n.title} className="border-[#DDE3F0]">
                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-[#00144C]">{n.title}</p>
                  <p className="text-xs text-[#305BA9] mt-1 leading-relaxed">{n.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      />
    </SlideLayout>
  );
}
