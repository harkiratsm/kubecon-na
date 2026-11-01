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
        "h-full flex flex-col px-10 py-6",
        centered && "items-center justify-center text-center",
        className
      )}
    >
      <div className={cn("mb-5 shrink-0", centered && "text-center")}>
        {badge && (
          <span className="inline-block mb-2 text-xs font-semibold text-[#3939D9] tracking-widest uppercase">
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-bold text-[#00144C] leading-tight">{heading}</h1>
        {subheading && <p className="mt-1.5 text-base text-[#305BA9]">{subheading}</p>}
      </div>
      <div className={cn("flex-1 overflow-hidden min-h-0", centered ? "flex items-center justify-center" : "")}>
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
    <div className={cn("rounded-lg border border-[#DDE3F0] overflow-hidden", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#3939D9]/8">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-[#00144C] border-b border-[#DDE3F0]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[#DDE3F0]/60 last:border-0 hover:bg-[#F5F7FC] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={cn("px-4 py-2.5 text-[#305BA9]", ci === 0 && "font-medium text-[#00144C]")}>
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
