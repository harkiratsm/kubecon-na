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

  const progress = ((current) / total) * 100;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-primary font-semibold tracking-widest uppercase">
            OpenKruise Agents
          </span>
          <span className="text-border">·</span>
          <span className="text-xs text-muted-foreground truncate max-w-md">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
            onClick={() => window.open(`${window.location.href}${window.location.search ? '&' : '?'}presenter`, "_blank", "width=1400,height=900")}
            title="Open Presenter View in a new window"
          >
            <Presentation className="w-3.5 h-3.5" />
            Presenter View
          </Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <span className="text-primary font-semibold">{String(current).padStart(2, "0")}</span>
            <span>/</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border/40 shrink-0">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-hidden relative">{children}</div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={current === 1}
          className={cn("gap-1 text-muted-foreground hover:text-foreground", current === 1 && "opacity-30")}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        {/* Dot indicators (max 22) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-200",
                i + 1 === current
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground cursor-pointer"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={current === total}
          className={cn("gap-1 text-muted-foreground hover:text-foreground", current === total && "opacity-30")}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
