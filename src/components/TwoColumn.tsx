import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TwoColumnProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  ratio?: "1:1" | "1:2" | "2:1";
}

export function TwoColumn({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  ratio = "1:1",
}: TwoColumnProps) {
  const colClasses = {
    "1:1": ["flex-1", "flex-1"],
    "1:2": ["flex-none w-2/5", "flex-1"],
    "2:1": ["flex-1", "flex-none w-2/5"],
  };
  const [leftCol, rightCol] = colClasses[ratio];

  return (
    <div className={cn("flex gap-6 w-full", className)}>
      <div className={cn(leftCol, leftClassName)}>{left}</div>
      <div className={cn(rightCol, rightClassName)}>{right}</div>
    </div>
  );
}
