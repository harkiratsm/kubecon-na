import { useState, useCallback, useEffect, useRef } from "react";
import { SlideShell } from "@/components/SlideShell";
import { PresenterView } from "@/components/PresenterView";
import { KubeConFrame } from "@/components/brand/KubeConFrame";
import { SLIDES } from "@/data/slides";

const CHANNEL_NAME = "slide-deck-sync";

function isPresenterMode() {
  return new URLSearchParams(window.location.search).has("presenter");
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const total = SLIDES.length;
  const presenter = isPresenterMode();

  // BroadcastChannel — audience window listens for changes from presenter window
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
    const next = Math.min(currentIndex + 1, total - 1);
    setCurrentIndex(next);
    broadcast(next);
  }, [currentIndex, total, broadcast]);

  const goPrev = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    broadcast(prev);
  }, [currentIndex, broadcast]);

  if (presenter) {
    return <PresenterView initialIndex={currentIndex} />;
  }

  const current = SLIDES[currentIndex];
  const SlideComponent = current.component;

  return (
    <SlideShell
      current={currentIndex + 1}
      total={total}
      title={current.title}
      onNext={goNext}
      onPrev={goPrev}
    >
      <KubeConFrame variant={current.variant} slideNumber={currentIndex + 1}>
        <SlideComponent />
      </KubeConFrame>
    </SlideShell>
  );
}
