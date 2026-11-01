import { cn } from "@/lib/utils";

interface KubeConLogoProps {
  variant?: "white" | "blue";
  className?: string;
}

export function KubeConLogo({ variant = "blue", className }: KubeConLogoProps) {
  const src = variant === "white" ? "/branding/logo-white.svg" : "/branding/logo-blue.svg";
  const caption = variant === "white" ? "text-white" : "text-[#00144C]";
  return (
    <div className={cn("inline-flex flex-col", className)}>
      <img
        src={src}
        alt="KubeCon + CloudNativeCon North America 2026"
        className="w-full h-auto object-contain object-top [clip-path:inset(0_0_16%_0)]"
        draggable={false}
      />
      <p className={cn("text-center font-semibold tracking-[0.16em] uppercase leading-none -mt-[8%] text-[9px]", caption)}>
        North America 2026
      </p>
    </div>
  );
}
