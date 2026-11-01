import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Monitor, Mic, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SLIDES } from "@/data/slides";
import { SCRIPT_DATA } from "@/data/scriptData";
import { SlidePreview } from "@/components/brand/SlidePreview";
import { KubeConLogo } from "@/components/brand/KubeConLogo";
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "l" || e.key === "L") { setLearnMode((m) => !m); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

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

  const progress = ((currentIndex + 1) / total) * 100;
  const totalSeconds = 30 * 60;
  const overTime = elapsed > totalSeconds;

  return (
    <div className="h-screen w-screen bg-[#0B1029] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 shrink-0 bg-[#00144C]">
        <div className="flex items-center gap-4">
          <KubeConLogo variant="white" className="w-[120px] hidden sm:block" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3939D9]/30 border border-[#3939D9]/50">
            <Mic className="w-3 h-3 text-[#B0DDFF]" />
            <span className="text-xs font-semibold text-[#B0DDFF] tracking-wider uppercase">
              Presenter View
            </span>
          </div>
          <span className="text-xs text-white/50">{current.section}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-lg font-bold",
              overTime
                ? "text-red-400 border-red-500/40 bg-red-500/10"
                : elapsed > totalSeconds * 0.85
                ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
                : "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(elapsed)}
            <span className="text-xs font-normal opacity-60">/ 30:00</span>
          </div>
          <Button
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className={cn(
              "text-xs",
              running
                ? "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                : "bg-[#3939D9] hover:bg-[#3939D9]/90 text-white"
            )}
          >
            {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
          </Button>
          {elapsed > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => { setElapsed(0); setRunning(false); }}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLearnMode((m) => !m)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
              learnMode
                ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                : "bg-white/5 border-white/15 text-white/60 hover:text-white hover:border-white/30"
            )}
            title="Toggle Learn Mode (L)"
          >
            {learnMode ? <BookOpen className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {learnMode ? "Learn Mode" : "Quick Notes"}
          </button>
          <span className="text-2xl font-black font-mono text-[#B0DDFF]">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-white/40 text-sm">/ {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 shrink-0">
        <div
          className="h-full bg-[#3939D9] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {learnMode && (
        <div className="shrink-0 px-5 py-2 bg-amber-500/15 border-b border-amber-400/30 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <p className="text-xs text-amber-200 font-medium">
            Learn Mode — deep-dive explanations for every concept. Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-amber-500/25 font-mono text-amber-100">L</kbd> to toggle.
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 gap-0 overflow-hidden min-h-0">

        {/* LEFT — slide previews */}
        <div className="w-[38%] border-r border-white/10 flex flex-col overflow-hidden bg-[#0B1029]">

          {/* Current slide preview */}
          <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden min-h-0">
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <Monitor className="w-3.5 h-3.5 text-[#B0DDFF]" />
              <span className="text-xs font-semibold text-[#B0DDFF] uppercase tracking-wider">
                Current Slide
              </span>
            </div>
            <div
              className="flex-1 rounded-xl overflow-hidden border-2 border-[#3939D9]/50 shadow-lg shadow-[#3939D9]/20 relative min-h-0"
            >
              <SlidePreview
                component={current.component}
                variant={current.variant}
                slideNumber={currentIndex + 1}
                className="absolute inset-0"
              />
            </div>
          </div>

          <div className="h-px bg-white/10 shrink-0" />

          {/* Next slide preview */}
          <div className="h-[32%] p-4 flex flex-col gap-2 overflow-hidden shrink-0">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider shrink-0">
              Next Up
            </span>
            {next ? (
              <>
                <div className="flex-1 rounded-lg overflow-hidden border border-white/15 relative min-h-0">
                  <SlidePreview
                    component={next.component}
                    variant={next.variant}
                    slideNumber={currentIndex + 2}
                    className="absolute inset-0"
                  />
                </div>
                <p className="text-xs text-white/50 truncate shrink-0">{next.title}</p>
              </>
            ) : (
              <div className="flex-1 rounded-lg border border-white/10 flex items-center justify-center">
                <p className="text-xs text-white/40">End of presentation</p>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="p-3 flex gap-2 border-t border-white/10 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1 bg-[#3939D9] hover:bg-[#3939D9]/90 text-white"
              onClick={goNext}
              disabled={currentIndex === total - 1}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT — script panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111836]">
          {script ? (
            !learnMode ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-white leading-tight">{current.title}</h2>
                  <span className="shrink-0 text-xs font-mono px-2 py-1 rounded bg-white/10 text-white/70">
                    {script.duration}
                  </span>
                </div>

                <div className="rounded-lg border border-[#3939D9]/40 bg-[#3939D9]/15 p-4">
                  <p className="text-xs font-semibold text-[#B0DDFF] uppercase tracking-wider mb-2">
                    Opening Line
                  </p>
                  <p className="text-sm text-white leading-relaxed font-medium italic">
                    &ldquo;{script.openingLine}&rdquo;
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    Talking Points
                  </p>
                  <ul className="space-y-2.5">
                    {script.talkingPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-[#3939D9]/30 border border-[#3939D9]/50 text-xs font-mono font-bold text-[#B0DDFF] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-white/85 leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-[#262267]/60 bg-[#262267]/20 p-4">
                  <p className="text-xs font-semibold text-[#B0DDFF] uppercase tracking-wider mb-2">
                    Transition →
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed italic">
                    &ldquo;{script.transition}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-white leading-tight">{current.title}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                      Learn Mode
                    </span>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-white/10 text-white/70">
                      {script.duration}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    What You&apos;ll Say
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed italic">
                    &ldquo;{script.openingLine}&rdquo;
                  </p>
                </div>

                {script.deepDive && script.deepDive.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-amber-300/80 uppercase tracking-wider">
                      Deep Dive — Understand Every Concept
                    </p>
                    {script.deepDive.map((section, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/40 text-xs font-mono font-bold text-amber-300 flex items-center justify-center shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="space-y-1.5 min-w-0">
                            <p className="text-sm font-semibold text-amber-200">{section.heading}</p>
                            <p className="text-sm text-white/75 leading-relaxed">{section.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/40">No deep-dive content for this slide.</p>
                )}

                <div className="rounded-lg border border-[#262267]/60 bg-[#262267]/20 p-4">
                  <p className="text-xs font-semibold text-[#B0DDFF] uppercase tracking-wider mb-2">
                    Transition →
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed italic">
                    &ldquo;{script.transition}&rdquo;
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">No script for this slide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
