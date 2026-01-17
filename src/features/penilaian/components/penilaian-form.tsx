"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"; // Icon tambahan

import { cn } from "@/lib/utils"; // Utility untuk class merging
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"; // Komponen untuk Search
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Komponen untuk Popover dropdown
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreatePenilaian } from "../hooks/use-penilaian";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// Opsi Penilaian Standar
const RATING_OPTIONS = [
  { label: "Sangat Baik (5)", value: 5 },
  { label: "Baik (4)", value: 4 },
  { label: "Cukup (3)", value: 3 },
  { label: "Kurang (2)", value: 2 },
  { label: "Sangat Kurang (1)", value: 1 },
];

type FormValues = {
  karyawanId: string;
  bulan: string;
  tahun: string;
  detailSkor: {
    subKriteriaId: string;
    kriteriaId: string;
    namaSubKriteria: string;
    nilai: string;
  }[];
};

export const PenilaianForm = () => {
  const trpc = useTRPC();
  const createMutation = useCreatePenilaian();

  // State untuk mengontrol buka/tutup popover search karyawan
  const [openCombobox, setOpenCombobox] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      karyawanId: "",
      bulan: new Date().getMonth().toString(),
      tahun: new Date().getFullYear().toString(),
      detailSkor: [],
    },
  });

  // Watchers
  const detailSkorValues = form.watch("detailSkor");
  const selectedKaryawanId = form.watch("karyawanId");

  // Fetch Data Karyawan
  const { data: listKaryawan, isLoading: isLoadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions()
  );

  const selectedKaryawan = listKaryawan?.find(
    (k) => k.id === selectedKaryawanId
  );

  // Fetch Kriteria
  const { data: listKriteria, isLoading: isLoadingKriteria } = useQuery(
    trpc.kriteria.getByDivisi.queryOptions(
      { divisi: selectedKaryawan?.divisi as any },
      { enabled: !!selectedKaryawan?.divisi }
    )
  );

  // --- OPTIMASI PERFORMA (Agar tidak berat) ---
  const subKriteriaIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (detailSkorValues) {
      detailSkorValues.forEach((item, index) => {
        if (item.subKriteriaId) {
          map[item.subKriteriaId] = index;
        }
      });
    }
    return map;
  }, [detailSkorValues]);

  // Effect: Populate Form Default Values
  useEffect(() => {
    if (listKriteria && listKriteria.length > 0) {
      const initialValues: any[] = [];
      listKriteria.forEach((k) => {
        if (k.subKriteria && k.subKriteria.length > 0) {
          k.subKriteria.forEach((sub) => {
            initialValues.push({
              subKriteriaId: sub.id,
              kriteriaId: k.id,
              namaSubKriteria: sub.nama,
              nilai: "",
            });
          });
        }
      });
      // Gunakan opsi dirty false agar render lebih efisien
      form.setValue("detailSkor", initialValues, {
        shouldDirty: false,
        shouldTouch: false,
      });
    } else {
      form.setValue("detailSkor", []);
    }
  }, [listKriteria, form.setValue]);

  const onSubmit = (values: FormValues) => {
    if (values.detailSkor.length === 0) return;
    if (values.detailSkor.some((s) => !s.nilai)) {
      toast.error("Mohon lengkapi semua penilaian.");
      return;
    }

    createMutation.mutate({
      karyawanId: values.karyawanId,
      bulan: parseInt(values.bulan),
      tahun: parseInt(values.tahun),
      detailSkor: values.detailSkor.map((s) => ({
        subKriteriaId: s.subKriteriaId,
        nilai: parseInt(s.nilai),
      })),
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const isFormReady = detailSkorValues.length > 0;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Input Penilaian Kinerja</CardTitle>
        <CardDescription>
          Evaluasi kinerja karyawan berdasarkan kriteria divisi{" "}
          <strong>{selectedKaryawan?.divisi}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* BAGIAN 1: IDENTITAS (Update: Karyawan Searchable) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- SEARCHABLE DROPDOWN KARYAWAN --- */}
              <FormField
                control={form.control}
                name="karyawanId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pilih Karyawan</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingKaryawan}
                          >
                            {field.value
                              ? listKaryawan?.find((k) => k.id === field.value)
                                  ?.nama
                              : "Cari nama karyawan..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Ketik nama..." />
                          <CommandList>
                            <CommandEmpty>
                              Karyawan tidak ditemukan.
                            </CommandEmpty>
                            <CommandGroup>
                              {listKaryawan?.map((karyawan) => (
                                <CommandItem
                                  value={karyawan.nama} // Ini yang dipakai buat filter search
                                  key={karyawan.id}
                                  onSelect={() => {
                                    form.setValue("karyawanId", karyawan.id);
                                    setOpenCombobox(false); // Tutup popover setelah pilih
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      karyawan.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{karyawan.nama}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {karyawan.divisi} - {karyawan.nip}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* INPUT BULAN & TAHUN (Tetap) */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="bulan"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Bulan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bulan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Januari",
                            "Februari",
                            "Maret",
                            "April",
                            "Mei",
                            "Juni",
                            "Juli",
                            "Agustus",
                            "September",
                            "Oktober",
                            "November",
                            "Desember",
                          ].map((bln, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {bln}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tahun"
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Tahun</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Thn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* BAGIAN 2: FORM PENILAIAN GROUPING (Optimized Version) */}
            <div className="space-y-6">
              {isLoadingKriteria ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" />
                </div>
              ) : !selectedKaryawanId ? (
                <div className="text-center py-8 text-muted-foreground bg-slate-50 border border-dashed rounded-lg">
                  Pilih karyawan terlebih dahulu.
                </div>
              ) : listKriteria?.length === 0 ? (
                <div className="text-center py-8 text-yellow-600 bg-yellow-50 rounded-lg">
                  Kriteria belum diatur admin.
                </div>
              ) : !isFormReady ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyiapkan formulir...
                </div>
              ) : (
                listKriteria?.map((kriteria) => (
                  <div
                    key={kriteria.id}
                    className="border rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-100 px-4 py-3 border-b">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                        {kriteria.nama}
                      </h3>
                    </div>

                    <div className="divide-y bg-white">
                      {kriteria.subKriteria.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground italic">
                          Tidak ada item penilaian.
                        </div>
                      ) : (
                        kriteria.subKriteria.map((sub) => {
                          // USE MAP LOOKUP (O(1)) instead of findIndex (O(N))
                          const fieldIndex = subKriteriaIndexMap[sub.id];

                          if (fieldIndex === undefined) return null;

                          return (
                            <div
                              key={sub.id}
                              className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                            >
                              <div className="md:col-span-2">
                                <p className="font-medium text-slate-900">
                                  {sub.nama}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Berikan penilaian untuk aspek ini.
                                </p>
                              </div>

                              <FormField
                                control={form.control}
                                name={`detailSkor.${fieldIndex}.nilai`}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      value={field.value} // Controlled input
                                    >
                                      <FormControl>
                                        <SelectTrigger
                                          className={
                                            !field.value
                                              ? "text-muted-foreground"
                                              : ""
                                          }
                                        >
                                          <SelectValue placeholder="-- Pilih Nilai --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent align="end">
                                        {RATING_OPTIONS.map((opt) => (
                                          <SelectItem
                                            key={opt.value}
                                            value={opt.value.toString()}
                                          >
                                            <span className="font-semibold text-primary mr-2">
                                              {opt.value}
                                            </span>
                                            - {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={createMutation.isPending || !isFormReady}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Simpan Hasil Penilaian
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
