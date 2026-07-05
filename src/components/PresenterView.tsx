import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Monitor, Mic, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SLIDES } from "@/data/slides";
import { SCRIPT_DATA } from "@/data/scriptData";
import { cn } from "@/lib/utils";

const CHANNEL_NAME = "slide-deck-sync";

interface PresenterViewProps {
  initialIndex: number;
}

export function PresenterView({ initialIndex }: PresenterViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [learnMode, setLearnMode] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = SLIDES.length;
  const current = SLIDES[currentIndex];
  const next = SLIDES[currentIndex + 1] ?? null;
  const script = SCRIPT_DATA.find((s) => s.id === currentIndex + 1);

  // BroadcastChannel setup — stay in sync with audience window
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;
    ch.onmessage = (e) => {
      if (e.data?.type === "SLIDE_CHANGE") {
        setCurrentIndex(e.data.index);
      }
    };
    return () => ch.close();
  }, []);

  const broadcast = useCallback((index: number) => {
    channelRef.current?.postMessage({ type: "SLIDE_CHANGE", index });
  }, []);

  const goNext = useCallback(() => {
    const nxt = Math.min(currentIndex + 1, total - 1);
    setCurrentIndex(nxt);
    broadcast(nxt);
  }, [currentIndex, total, broadcast]);

  const goPrev = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    broadcast(prev);
  }, [currentIndex, broadcast]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "l" || e.key === "L") { setLearnMode((m) => !m); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Stopwatch
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const SlideComponent = current.component;
  const NextSlideComponent = next?.component ?? null;
  const progress = ((currentIndex + 1) / total) * 100;
  const totalSeconds = 30 * 60;
  const overTime = elapsed > totalSeconds;

  return (
    <div className="h-screen w-screen bg-[hsl(220,20%,5%)] text-foreground flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
            <Mic className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wider uppercase">Presenter View</span>
          </div>
          <span className="text-xs text-muted-foreground">{current.section}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-lg font-bold",
              overTime
                ? "text-destructive border-destructive/30 bg-destructive/10"
                : elapsed > totalSeconds * 0.85
                ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(elapsed)}
            <span className="text-xs font-normal opacity-60">/ 30:00</span>
          </div>
          <Button
            variant={running ? "secondary" : "default"}
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className="text-xs"
          >
            {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
          </Button>
          {elapsed > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground"
              onClick={() => { setElapsed(0); setRunning(false); }}>
              Reset
            </Button>
          )}
        </div>

        {/* Right side: Learn Mode toggle + counter */}
        <div className="flex items-center gap-3">
          {/* Learn Mode toggle */}
          <button
            onClick={() => setLearnMode((m) => !m)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
              learnMode
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20"
                : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
            )}
            title="Toggle Learn Mode (L)"
          >
            {learnMode ? <BookOpen className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {learnMode ? "Learn Mode" : "Quick Notes"}
          </button>
          <span className="text-2xl font-black font-mono text-primary">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="text-muted-foreground text-sm">/ {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border/30 shrink-0">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Learn Mode banner */}
      {learnMode && (
        <div className="shrink-0 px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300 font-medium">
            Learn Mode ON — showing deep-dive explanations so you can understand every concept from scratch. Press <kbd className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-amber-200">L</kbd> to toggle.
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT — slide previews */}
        <div className="w-[38%] border-r border-border/30 flex flex-col gap-0 overflow-hidden">

          {/* Current slide preview */}
          <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Slide</span>
            </div>
            <div
              className="flex-1 rounded-xl overflow-hidden border border-primary/30 shadow-lg shadow-primary/10 bg-background relative"
              style={{ minHeight: 0 }}
            >
              <div className="absolute inset-0 origin-top-left"
                style={{
                  transform: "scale(0.38)",
                  width: "263%",
                  height: "263%",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <SlideComponent />
              </div>
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Next slide preview */}
          <div className="h-[32%] p-4 flex flex-col gap-2 overflow-hidden">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Up</span>
            {NextSlideComponent ? (
              <>
                <div
                  className="flex-1 rounded-lg overflow-hidden border border-border/40 bg-background relative"
                  style={{ minHeight: 0 }}
                >
                  <div className="absolute inset-0 origin-top-left"
                    style={{
                      transform: "scale(0.27)",
                      width: "370%",
                      height: "370%",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    <NextSlideComponent />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{next?.title}</p>
              </>
            ) : (
              <div className="flex-1 rounded-lg border border-border/30 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">End of presentation</p>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="p-3 flex gap-2 border-t border-border/30">
            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button variant="default" size="sm" className="flex-1 gap-1" onClick={goNext} disabled={currentIndex === total - 1}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT — script panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {script ? (
            !learnMode ? (
              /* ── QUICK NOTES mode ── */
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-foreground leading-tight">{current.title}</h2>
                  <Badge variant="secondary" className="shrink-0 text-xs font-mono">{script.duration}</Badge>
                </div>

                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Opening Line</p>
                    <p className="text-sm text-foreground leading-relaxed font-medium italic">
                      "{script.openingLine}"
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Talking Points
                  </p>
                  <ul className="space-y-2.5">
                    {script.talkingPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-muted/60 border border-border text-xs font-mono font-bold text-muted-foreground flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <Card className="border-accent/30 bg-accent/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Transition →</p>
                    <p className="text-sm text-foreground leading-relaxed italic">
                      "{script.transition}"
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* ── LEARN MODE ── */
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-foreground leading-tight">{current.title}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-mono">
                      Learn Mode
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">{script.duration}</Badge>
                  </div>
                </div>

                {/* Context opener */}
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">What You'll Say</p>
                    <p className="text-sm text-foreground/80 leading-relaxed italic">"{script.openingLine}"</p>
                  </CardContent>
                </Card>

                {/* Deep dive sections */}
                {script.deepDive && script.deepDive.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
                      Deep Dive — Understand Every Concept
                    </p>
                    {script.deepDive.map((section, i) => (
                      <Card key={i} className="border-border/40 bg-muted/10">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 flex items-center justify-center shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="space-y-1.5 min-w-0">
                              <p className="text-sm font-semibold text-amber-200">{section.heading}</p>
                              <p className="text-sm text-foreground/85 leading-relaxed">{section.body}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deep-dive content for this slide.</p>
                )}

                {/* Transition reminder */}
                <Card className="border-accent/30 bg-accent/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Transition →</p>
                    <p className="text-sm text-foreground leading-relaxed italic">"{script.transition}"</p>
                  </CardContent>
                </Card>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No script for this slide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
