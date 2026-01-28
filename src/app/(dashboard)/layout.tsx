import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* 1. min-h-screen: Memastikan container minimal setinggi layar browser.
        2. bg-muted/10: Memberikan warna dasar abu-abu tipis (opsional, agar card konten lebih pop-up).
      */}
      <div className="flex flex-col min-h-screen w-full bg-muted/10">
        <Navbar />

        {/* flex-1: Kunci agar konten mengisi ruang kosong. 
          Ini akan mendorong footer ke bawah jika kontennya sedikit.
        */}
        <main className="flex-1 w-full relative">{children}</main>

        {/* Footer Section */}
        <footer className="border-t bg-background py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row px-4 md:px-8 text-xs">
            <p className="text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold text-foreground">Kepswell</span>.
              All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Info versi membuat aplikasi terlihat well-maintained */}
              <span>v1.0.0</span>
              <span className="hidden md:inline text-muted-foreground/50">
                |
              </span>
              <span className="hover:text-foreground transition-colors cursor-default">
                Privacy Policy
              </span>
            </div>
          </div>
        </footer>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
