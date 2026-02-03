import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface ScoringOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ScoringOption({
  value,
  label,
  isSelected,
  onClick,
}: ScoringOptionProps) {
  // Helper: Tentukan tema warna berdasarkan nilai
  const getColorTheme = (val: number) => {
    if (val >= 4) {
      return {
        activeBorder: "border-emerald-500",
        activeBg: "bg-emerald-50/50",
        activeText: "text-emerald-700",
        activeRing: "ring-emerald-500",
        iconColor: "text-emerald-600",
      };
    }
    if (val <= 2) {
      return {
        activeBorder: "border-rose-500",
        activeBg: "bg-rose-50/50",
        activeText: "text-rose-700",
        activeRing: "ring-rose-500",
        iconColor: "text-rose-600",
      };
    }
    // Nilai Tengah (3)
    return {
      activeBorder: "border-amber-500",
      activeBg: "bg-amber-50/50",
      activeText: "text-amber-700",
      activeRing: "ring-amber-500",
      iconColor: "text-amber-600",
    };
  };

  const theme = getColorTheme(value);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ease-in-out",
        // Base Hover & Active States
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
        // Selected State Logic
        isSelected
          ? cn(theme.activeBorder, theme.activeBg, "ring-1", theme.activeRing)
          : "border-muted bg-card hover:border-primary/20 hover:bg-accent/50",
      )}
    >
      {/* Icon Status (Pojok Kanan Atas) */}
      <div className="absolute right-3 top-3">
        {isSelected ? (
          <CheckCircle2
            className={cn("h-5 w-5 transition-all", theme.iconColor)}
          />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/20 transition-all group-hover:text-muted-foreground/40" />
        )}
      </div>

      {/* Big Number (Hero) */}
      <div
        className={cn(
          "text-2xl font-black tracking-tighter transition-colors mt-2",
          isSelected
            ? theme.activeText
            : "text-slate-300 group-hover:text-slate-400",
        )}
      >
        {value}
      </div>

      {/* Label Text */}
      <div className="text-center space-y-0.5">
        <span
          className={cn(
            "block text-sm font-semibold tracking-wide",
            isSelected
              ? theme.activeText
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {label}
        </span>
        <span className="block text-[10px] text-muted-foreground/60 font-mono">
          Poin
        </span>
      </div>
    </div>
  );
}
