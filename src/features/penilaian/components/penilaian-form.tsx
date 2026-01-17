"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  { label: "Sangat Baik", value: 5, color: "text-green-600" },
  { label: "Baik", value: 4, color: "text-blue-600" },
  { label: "Cukup", value: 3, color: "text-yellow-600" },
  { label: "Kurang", value: 2, color: "text-orange-600" },
  { label: "Sangat Kurang", value: 1, color: "text-red-600" },
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
  const [openCombobox, setOpenCombobox] = useState(false);

  // Default Form
  const form = useForm<FormValues>({
    defaultValues: {
      karyawanId: "",
      bulan: new Date().getMonth().toString(), // 0-11
      tahun: new Date().getFullYear().toString(),
      detailSkor: [],
    },
  });

  // Watchers
  const detailSkorValues = form.watch("detailSkor");
  const selectedKaryawanId = form.watch("karyawanId");

  // 1. Fetch Data Karyawan
  const { data: listKaryawan, isLoading: isLoadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions()
  );

  const selectedKaryawan = listKaryawan?.find(
    (k) => k.id === selectedKaryawanId
  );

  // 2. Fetch Kriteria by Divisi Karyawan
  const { data: listKriteria, isLoading: isLoadingKriteria } = useQuery(
    trpc.kriteria.getByDivisi.queryOptions(
      { divisi: selectedKaryawan?.divisi as any },
      { enabled: !!selectedKaryawan?.divisi }
    )
  );

  // 3. Optimasi Index Map (Agar render cepat)
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

  // 4. Auto Populate Form saat Kriteria Berubah
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
              nilai: "", // Default kosong
            });
          });
        }
      });

      // Reset form dengan struktur baru
      form.setValue("detailSkor", initialValues, {
        shouldDirty: false,
        shouldTouch: false,
      });
    } else {
      form.setValue("detailSkor", []);
    }
  }, [listKriteria, form.setValue]);

  // 5. Submit Handler
  const onSubmit = (values: FormValues) => {
    if (values.detailSkor.length === 0) return;

    // Validasi manual: Cek apakah ada nilai kosong
    if (values.detailSkor.some((s) => !s.nilai)) {
      toast.error("Form belum lengkap", {
        description: "Mohon isi nilai untuk semua kriteria yang tersedia.",
      });
      return;
    }

    createMutation.mutate(
      {
        karyawanId: values.karyawanId,
        bulan: parseInt(values.bulan),
        tahun: parseInt(values.tahun),
        detailSkor: values.detailSkor.map((s) => ({
          subKriteriaId: s.subKriteriaId,
          nilai: parseInt(s.nilai),
        })),
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Penilaian Berhasil Disimpan");
        },
      }
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const isFormReady = detailSkorValues.length > 0;

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="bg-slate-50/50 border-b pb-6">
        <CardTitle className="text-xl">Formulir Penilaian Kinerja</CardTitle>
        <CardDescription>
          Silakan pilih karyawan dan isi penilaian sesuai indikator divisi{" "}
          {selectedKaryawan?.divisi ? (
            <span className="font-semibold text-primary px-1 bg-primary/10 rounded">
              {selectedKaryawan.divisi}
            </span>
          ) : (
            "..."
          )}
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* --- SECTION 1: PILIH KARYAWAN & PERIODE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg border">
              {/* SEARCHABLE COMBOBOX KARYAWAN */}
              <FormField
                control={form.control}
                name="karyawanId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nama Karyawan</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn(
                              "w-full justify-between h-10",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingKaryawan}
                          >
                            {field.value
                              ? listKaryawan?.find((k) => k.id === field.value)
                                  ?.nama
                              : "Cari karyawan..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari nama..." />
                          <CommandList>
                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                            <CommandGroup heading="Daftar Karyawan">
                              {listKaryawan?.map((karyawan) => (
                                <CommandItem
                                  value={karyawan.nama}
                                  key={karyawan.id}
                                  onSelect={() => {
                                    form.setValue("karyawanId", karyawan.id);
                                    setOpenCombobox(false);
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
                                    <span className="font-medium">
                                      {karyawan.nama}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {karyawan.divisi} • {karyawan.nip}
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

              {/* PERIODE PENILAIAN */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bulan"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>Tahun</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tahun" />
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

            {/* --- SECTION 2: FORM DINAMIS (Kriteria) --- */}
            <div className="space-y-6 min-h-[200px]">
              {/* STATE: LOADING KRITERIA */}
              {isLoadingKriteria && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Memuat formulir kriteria...</p>
                </div>
              )}

              {/* STATE: BELUM PILIH KARYAWAN */}
              {!isLoadingKriteria && !selectedKaryawanId && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-slate-50 text-muted-foreground">
                  <p className="font-medium">Formulir terkunci</p>
                  <p className="text-sm">
                    Silakan pilih karyawan di atas untuk menampilkan kriteria
                    penilaian.
                  </p>
                </div>
              )}

              {/* STATE: FORM READY */}
              {!isLoadingKriteria && selectedKaryawanId && listKriteria && (
                <>
                  {listKriteria.length === 0 ? (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
                      Belum ada kriteria yang diatur untuk divisi ini. Hubungi
                      Admin/Manager.
                    </div>
                  ) : (
                    listKriteria.map((kriteria) => (
                      <Card
                        key={kriteria.id}
                        className="overflow-hidden border shadow-sm"
                      >
                        <div className="bg-slate-100/80 px-4 py-2 border-b flex justify-between items-center">
                          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-700">
                            {kriteria.nama}
                          </h3>
                          <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border">
                            Bobot: {kriteria.bobot}%
                          </span>
                        </div>

                        <div className="divide-y">
                          {kriteria.subKriteria.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground italic text-center">
                              Tidak ada sub-kriteria.
                            </div>
                          ) : (
                            kriteria.subKriteria.map((sub) => {
                              // Optimized Lookup
                              const fieldIndex = subKriteriaIndexMap[sub.id];
                              if (fieldIndex === undefined) return null;

                              return (
                                <div
                                  key={sub.id}
                                  className="p-4 hover:bg-slate-50/50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                                >
                                  {/* Label Pertanyaan */}
                                  <div className="md:col-span-8">
                                    <p className="font-medium text-slate-900">
                                      {sub.nama}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Berikan skor penilaian objektif (1-5)
                                    </p>
                                  </div>

                                  {/* Input Dropdown */}
                                  <div className="md:col-span-4">
                                    <FormField
                                      control={form.control}
                                      name={`detailSkor.${fieldIndex}.nilai`}
                                      render={({ field }) => (
                                        <FormItem className="space-y-0">
                                          <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger
                                                className={cn(
                                                  "h-10",
                                                  field.value
                                                    ? "border-primary/50 bg-primary/5 text-primary font-medium"
                                                    : ""
                                                )}
                                              >
                                                <SelectValue placeholder="Pilih Nilai" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent align="end">
                                              {RATING_OPTIONS.map((opt) => (
                                                <SelectItem
                                                  key={opt.value}
                                                  value={opt.value.toString()}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span
                                                      className={cn(
                                                        "font-bold w-4",
                                                        opt.color
                                                      )}
                                                    >
                                                      {opt.value}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                      - {opt.label}
                                                    </span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>

            {/* BUTTON SUBMIT */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold shadow-md transition-all active:scale-[0.98]"
                disabled={createMutation.isPending || !isFormReady}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan Penilaian...
                  </>
                ) : (
                  "Simpan Penilaian"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
