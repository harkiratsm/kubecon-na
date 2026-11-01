import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideShellProps {
  current: number;
  total: number;
  title: string;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
}

export function SlideShell({ current, total, title, onNext, onPrev, children }: SlideShellProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev]);

  const progress = (current / total) * 100;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F0F2FA]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-[#DDE3F0] bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold text-[#3939D9] tracking-wide uppercase shrink-0">
            KubeCon NA 2026
          </span>
          <span className="text-[#DDE3F0]">·</span>
          <span className="text-xs text-[#305BA9] truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[#305BA9] hover:text-[#3939D9]"
            onClick={() =>
              window.open(
                `${window.location.href}${window.location.search ? "&" : "?"}presenter`,
                "_blank",
                "width=1400,height=900"
              )
            }
            title="Open Presenter View in a new window"
          >
            <Presentation className="w-3.5 h-3.5" />
            Presenter View
          </Button>
          <div className="flex items-center gap-1 text-xs text-[#305BA9] font-mono">
            <span className="text-[#3939D9] font-bold">{String(current).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#DDE3F0] shrink-0">
        <div
          className="h-full bg-[#3939D9] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content — 16:9 aspect feel */}
      <div className="flex-1 overflow-hidden relative p-3">
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg shadow-[#3939D9]/10 border border-[#DDE3F0]">
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-[#DDE3F0] bg-white shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={current === 1}
          className={cn("gap-1 text-[#305BA9] hover:text-[#00144C]", current === 1 && "opacity-30")}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        <div className="flex items-center gap-1 max-w-[50%] overflow-hidden">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-200 shrink-0",
                i + 1 === current
                  ? "w-4 h-1.5 bg-[#3939D9]"
                  : "w-1.5 h-1.5 bg-[#DDE3F0] hover:bg-[#305BA9]/40 cursor-pointer"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={current === total}
          className={cn("gap-1 text-[#305BA9] hover:text-[#00144C]", current === total && "opacity-30")}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
