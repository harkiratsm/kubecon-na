import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KubeConLogo } from "./KubeConLogo";

export type SlideVariant = "title" | "content" | "section";

interface KubeConFrameProps {
  variant?: SlideVariant;
  slideNumber?: number;
  children: ReactNode;
  className?: string;
}

export function KubeConFrame({
  variant = "content",
  slideNumber,
  children,
  className,
}: KubeConFrameProps) {
  if (variant === "title") {
    return (
      <div
        className={cn(
          "h-full relative overflow-hidden flex flex-col",
          "bg-[#113e82] text-white",
          className
        )}
      >
        <div className="relative z-10 flex-1 flex flex-col min-h-0">{children}</div>
        <img
          src="/branding/na-banner.png"
          alt="KubeCon + CloudNativeCon North America 2026, Salt Lake City"
          className="w-full h-auto shrink-0 object-contain"
          draggable={false}
        />
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div
        className={cn(
          "h-full relative overflow-hidden flex flex-col",
          "bg-[#3939D9] text-white",
          className
        )}
      >
        <div className="relative z-20 flex items-start justify-between px-8 pt-5 shrink-0">
          <KubeConLogo variant="white" className="w-[220px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 min-h-0">
          {children}
        </div>

      </div>
    );
  }

  // Content slide — white background, logo footer
  return (
    <div
      className={cn(
        "h-full relative overflow-hidden flex flex-col",
        "bg-white text-[#00144C]",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>

      {/* Footer bar */}
      <div className="shrink-0 flex items-end justify-between px-8 pb-4 pt-2 border-t border-[#3939D9]/10">
        <KubeConLogo variant="blue" className="w-[140px]" />
        {slideNumber !== undefined && (
          <span className="text-sm font-medium text-[#00144C]/60 tabular-nums">
            {slideNumber}
          </span>
        )}
      </div>
    </div>
  );
}
