import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  compact?: boolean;
}

export function CodeBlock({ code, language = "yaml", className, compact = false }: CodeBlockProps) {
  return (
    <div className={cn("rounded-lg overflow-hidden border border-border", className)}>
      {language && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/60 border-b border-border">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-1">{language}</span>
        </div>
      )}
      <pre
        className={cn(
          "bg-muted/30 overflow-x-auto font-mono text-sm leading-relaxed",
          compact ? "p-3 text-xs" : "p-4"
        )}
      >
        <code className="text-foreground/90">{code.trim()}</code>
      </pre>
    </div>
  );
}
