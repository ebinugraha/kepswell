// src/components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient, useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  NotebookPen,
  SettingsIcon,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    role: ["MANAGER", "HRD"],
  },
  {
    title: "Data Karyawan",
    url: "/karyawan",
    icon: Users,
    role: ["MANAGER", "HRD"],
  },
  {
    title: "Penilaian",
    url: "/penilaian",
    icon: NotebookPen,
    role: ["MANAGER", "HRD"],
  },
  {
    title: "Kriteria",
    url: "/kriteria",
    icon: SettingsIcon,
    role: ["MANAGER"],
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data } = useSession();

  const role = data?.user?.role;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm"
    >
      <SidebarHeader className="h-16 border-b border-border/50 px-4">
        <div className="flex items-center justify-between w-full mt-2">
          <Link
            href="/"
            className={`flex items-center gap-2 transition-all duration-300 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative w-8 h-8">
              <Image
                src="/logo.svg"
                alt="Kepswell Logo"
                fill
                className="object-contain"
              />
            </div>
            <span
              className={`font-bold text-xl transition-all duration-300 overflow-hidden ${
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              Kepswell
            </span>
          </Link>

          {/* Collapse button for desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={toggleSidebar}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-4">
          <SidebarGroupLabel
            className={`px-4 mb-2 text-xs font-medium text-muted-foreground transition-all duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;
                const hasAccess = item.role.includes(role || "");
                if (!hasAccess) return null;

                return (
                  <Tooltip key={item.title} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          tooltip={isCollapsed ? item.title : undefined}
                          isActive={isActive}
                          className={`w-full justify-start gap-3 transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <Link
                            href={item.url}
                            className="flex items-center w-full"
                          >
                            {isActive && (
                              <span className="absolute left-0 top-0 h-full w-1 bg-primary rounded-tl-md rounded-bl-md" />
                            )}
                            <Icon
                              className={`h-5 w-5 shrink-0 transition-colors ml-2 ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`font-medium transition-all duration-300 ${
                                isCollapsed
                                  ? "opacity-0 w-0 hidden"
                                  : "opacity-100"
                              }`}
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" align="center">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3">
        <SidebarMenu>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-3"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`font-medium transition-all duration-300 ${
                      isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                    }`}
                  >
                    Keluar
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" align="center">
                Keluar
              </TooltipContent>
            )}
          </Tooltip>

          {/* Version info - only visible when expanded */}
          <div
            className={`mt-3 px-3 py-2 text-xs text-center text-muted-foreground border-t border-border/50 transition-all duration-300 ${
              isCollapsed
                ? "opacity-0 h-0 overflow-hidden"
                : "opacity-100 h-auto"
            }`}
          >
            v1.0.0
          </div>
        </SidebarMenu>
      </SidebarFooter>

      {/* Sidebar collapse handle */}
      <SidebarRail
        onClick={toggleSidebar}
        className="cursor-pointer hover:bg-accent/50 transition-colors"
      />
    </Sidebar>
  );
}
