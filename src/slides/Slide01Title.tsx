import { Clock, MapPin } from "lucide-react";

export function Slide01Title() {
  return (
    <div className="flex-1 flex flex-col justify-center px-10 py-6 relative z-10 min-h-0">
      <div className="max-w-3xl">
        <h1 className="text-[1.85rem] font-bold leading-[1.12] text-white mb-2">
          Running MCP Servers at Scale:
          <br />
          Sandboxed Tool Execution on Kubernetes
        </h1>

        <p className="text-base font-semibold text-white/90 mb-3">
          One sandbox per session · Claimed in under 100ms · Tool state that survives the session
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>12 Nov · 3:30 – 4:00 pm</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Hyatt Regency · Level 2 · Salt Lake Ballroom DE</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wide">
            AI Inference + Agentic
          </span>
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wide">
            Beginner
          </span>
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold tracking-wide">
            OpenKruise Agents · CNCF
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-8 text-sm text-white">
          <p>
            <span className="font-bold">Harkirat Singh</span>
            <span className="text-white/75"> · Software Engineer</span>
          </p>
          <p>
            <span className="font-bold">Hrittik Roy</span>
            <span className="text-white/75"> · TPME, vCluster</span>
          </p>
        </div>
      </div>
    </div>
  );
}
