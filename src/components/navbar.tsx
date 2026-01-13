import { CalendarIcon } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="w-full h-14 flex items-center px-4 border-b justify-between">
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold">Kepswell</span>
        <div className="flex items-center text-xs gap-x-2 text-muted-foreground">
          <CalendarIcon className="size-3" />
          <span>Selasa, 13 Januari 2026</span>
        </div>
      </div>
    </nav>
  );
};
