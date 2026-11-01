import { useEffect, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { KubeConFrame, type SlideVariant } from "./KubeConFrame";

/** Reference slide dimensions (16:9) */
const SLIDE_W = 1600;
const SLIDE_H = 900;

interface SlidePreviewProps {
  component: ComponentType;
  variant: SlideVariant;
  slideNumber: number;
  className?: string;
}

/** Scaled-down slide preview for presenter view — uses fixed canvas + ResizeObserver */
export function SlidePreview({
  component: SlideComponent,
  variant,
  slideNumber,
  className,
}: SlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / SLIDE_W, height / SLIDE_H));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fallbackBg = variant === "title" || variant === "section" ? "#3939D9" : "#FFFFFF";

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ backgroundColor: fallbackBg }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
        }}
      >
        <KubeConFrame variant={variant} slideNumber={slideNumber} className="w-full h-full">
          <SlideComponent />
        </KubeConFrame>
      </div>
    </div>
  );
}
