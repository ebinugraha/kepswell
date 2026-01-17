"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Search,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"; // Pastikan komponen UI ini ada (dari shadcn)
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

// Jika belum punya hook debounce, bisa pakai logic sederhana atau buat file use-debounce.ts
function useDebounceValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const trpc = useTRPC();

  // Debounce input agar tidak spam request ke server
  const debouncedQuery = useDebounceValue(query, 300);

  // Fetch Data dari Server
  const { data: searchResults, isFetching } = useQuery(
    trpc.global.globalSearch.queryOptions(
      { query: debouncedQuery },
      { enabled: debouncedQuery.length > 0 }
    )
  );

  // Shortcut Keyboard (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Trigger Button di Navbar */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Cari sesuatu...</span>
        <span className="inline-flex lg:hidden">Cari...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Dialog Search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Ketik nama karyawan atau menu..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isFetching ? "Mencari..." : "Tidak ditemukan hasil."}
          </CommandEmpty>

          {/* HASIL PENCARIAN SERVER */}
          {searchResults?.karyawan && searchResults.karyawan.length > 0 && (
            <CommandGroup heading="Karyawan">
              {searchResults.karyawan.map((k) => (
                <CommandItem
                  key={k.id}
                  value={k.nama} // value ini digunakan untuk filter client-side bawaan cmdk
                  onSelect={() => {
                    // Arahkan ke detail karyawan atau form penilaian
                    runCommand(() => router.push(`/karyawan?search=${k.nama}`));
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{k.nama}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({k.divisi})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* NAVIGASI STATIC (Menu Cepat) */}
          <CommandGroup heading="Navigasi">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/karyawan"))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Data Karyawan</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/penilaian"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Input Penilaian</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/kriteria"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan Kriteria</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
