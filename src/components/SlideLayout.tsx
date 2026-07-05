import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SlideLayoutProps {
  heading: string;
  subheading?: string;
  children: ReactNode;
  className?: string;
  centered?: boolean;
  badge?: string;
}

export function SlideLayout({ heading, subheading, children, className, centered, badge }: SlideLayoutProps) {
  return (
    <div
      className={cn(
        "h-full flex flex-col px-12 py-8",
        centered && "items-center justify-center text-center",
        className
      )}
    >
      <div className={cn("mb-6 shrink-0", centered && "text-center")}>
        {badge && (
          <span className="inline-block mb-2 text-xs font-mono font-semibold text-primary tracking-widest uppercase">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold text-foreground leading-tight">{heading}</h1>
        {subheading && <p className="mt-2 text-lg text-muted-foreground">{subheading}</p>}
      </div>
      <div className={cn("flex-1 overflow-hidden", centered ? "flex items-center justify-center" : "")}>
        {children}
      </div>
    </div>
  );
}

interface ComparisonTableProps {
  headers: string[];
  rows: string[][];
  className?: string;
}

export function ComparisonTable({ headers, rows, className }: ComparisonTableProps) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={cn("px-4 py-3 text-muted-foreground", ci === 0 && "font-medium text-foreground")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
