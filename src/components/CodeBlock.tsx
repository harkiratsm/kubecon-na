import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  compact?: boolean;
}

export function CodeBlock({ code, language = "yaml", className, compact = false }: CodeBlockProps) {
  return (
    <div className={cn("rounded-lg overflow-hidden border border-[#DDE3F0]", className)}>
      {language && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F5F7FC] border-b border-[#DDE3F0]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC217]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3939D9]/50" />
          </div>
          <span className="text-xs text-[#305BA9] font-mono ml-1">{language}</span>
        </div>
      )}
      <pre
        className={cn(
          "bg-[#FAFBFE] overflow-x-auto font-mono text-sm leading-relaxed",
          compact ? "p-3 text-xs" : "p-4"
        )}
      >
        <code className="text-[#00144C]/90">{code.trim()}</code>
      </pre>
    </div>
  );
}
