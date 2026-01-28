"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreatePenilaian } from "../hooks/use-penilaian";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Opsi Penilaian Standar (Benefit)
const RATING_OPTIONS = [
  { label: "Sangat Baik", value: 5, color: "text-green-600" },
  { label: "Baik", value: 4, color: "text-blue-600" },
  { label: "Cukup", value: 3, color: "text-yellow-600" },
  { label: "Kurang", value: 2, color: "text-orange-600" },
  { label: "Sangat Kurang", value: 1, color: "text-red-600" },
];

// Opsi Penilaian Cost (Inverted)
const RATING_OPTIONS_COST = [
  { label: "Sangat Baik", value: 1, color: "text-green-600" },
  { label: "Baik", value: 2, color: "text-blue-600" },
  { label: "Cukup", value: 3, color: "text-yellow-600" },
  { label: "Kurang", value: 4, color: "text-orange-600" },
  { label: "Sangat Kurang", value: 5, color: "text-red-600" },
];

const DIVISIONS = ["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"];

const DIVISION_LABELS: Record<string, string> = {
  MARKETING: "Marketing",
  HOST_LIVE: "Host Live",
  PRODUKSI: "Produksi",
  ADMIN: "Admin",
};

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
  const [view, setView] = useState<"list" | "form">("list");
  const [selectedDivisi, setSelectedDivisi] = useState<string>("HOST_LIVE"); // Default DIVISI

  // Period Selection State (Global for the list)
  const [selectedBulan, setSelectedBulan] = useState<string>(
    new Date().getMonth().toString(),
  );
  const [selectedTahun, setSelectedTahun] = useState<string>(
    new Date().getFullYear().toString(),
  );

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

  // Computed Values
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const isFormReady = detailSkorValues.length > 0;

  // 1. Fetch Data Karyawan
  const { data: listKaryawan, isLoading: isLoadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions(),
  );

  const handleSelectKaryawan = (karyawanId: string) => {
    form.setValue("karyawanId", karyawanId);
    form.setValue("bulan", selectedBulan);
    form.setValue("tahun", selectedTahun);
    setView("form");
  };

  const selectedKaryawan = listKaryawan?.find(
    (k) => k.id === selectedKaryawanId,
  );

  // Filter Karyawan by Selected Divisi
  const filteredKaryawan = useMemo(() => {
    if (!listKaryawan) return [];
    if (selectedDivisi === "ALL") return listKaryawan;
    return listKaryawan.filter((k) => k.divisi === selectedDivisi);
  }, [listKaryawan, selectedDivisi]);

  // Available Divisions (Dynamic based on data + Static Fallback)
  const availableDivisions = useMemo(() => {
    const divs = new Set(DIVISIONS);
    if (listKaryawan) {
      listKaryawan.forEach((k) => {
        if (k.divisi) divs.add(k.divisi);
      });
    }
    return Array.from(divs);
  }, [listKaryawan]);

  // 2. Fetch Kriteria by Divisi Karyawan
  const { data: listKriteria, isLoading: isLoadingKriteria } = useQuery(
    trpc.kriteria.getByDivisi.queryOptions(
      { divisi: selectedKaryawan?.divisi as any },
      { enabled: !!selectedKaryawan?.divisi },
    ),
  );

  // 3. Fetch Existing Penilaian (Untuk cek status sudah dinilai/belum)
  const { data: listPenilaian } = useQuery(
    trpc.penilaian.getByPeriode.queryOptions({
      bulan: parseInt(selectedBulan),
      tahun: parseInt(selectedTahun),
      divisi: selectedDivisi === "ALL" ? undefined : (selectedDivisi as any),
    }),
  );

  // Set of IDs yang sudah dinilai
  const assessedKaryawanIds = useMemo(() => {
    if (!listPenilaian) return new Set<string>();
    return new Set(listPenilaian.map((p) => p.karyawanId));
  }, [listPenilaian]);

  // 4. Optimasi Index Map (Agar render cepat)
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
      // Jangan reset detailSkor jika sedang loading kriteria baru (menghindari layout shift/flicker yg tidak perlu jika belum siap)
      if (selectedKaryawanId && !isLoadingKriteria) {
        form.setValue("detailSkor", []);
      }
    }
  }, [listKriteria, form.setValue, selectedKaryawanId, isLoadingKriteria]);

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
          // Kembali ke list view
          setView("list");
          toast.success("Penilaian Berhasil Disimpan", {
            description: `Penilaian untuk ${selectedKaryawan?.nama} berhasil disimpan.`,
          });
        },
      },
    );
  };

  // --- VIEW: LIST KARYAWAN (TABLE) ---
  if (view === "list") {
    return (
      <Card className="w-full border-none shadow-none">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Daftar Karyawan</CardTitle>
              <CardDescription>
                Pilih karyawan berdasarkan divisi untuk mulai melakukan
                penilaian.
              </CardDescription>
            </div>

            {/* Filters Container */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-end">
              {/* Division Filter */}
              <div className="w-full sm:w-[200px] space-y-2">
                <Label>Divisi</Label>
                <Select
                  value={selectedDivisi}
                  onValueChange={setSelectedDivisi}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Divisi</SelectItem>
                    {availableDivisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {DIVISION_LABELS[div] || div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulan Filter */}
              <div className="w-full sm:w-[150px] space-y-2">
                <Label>Bulan</Label>
                <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
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
                      <SelectItem key={bln} value={i.toString()}>
                        {bln}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tahun Filter */}
              <div className="w-full sm:w-[120px] space-y-2">
                <Label>Tahun</Label>
                <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingKaryawan ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKaryawan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada karyawan ditemukan di divisi ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKaryawan.map((karyawan) => (
                    <TableRow key={karyawan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                          </div>
                          {karyawan.nama}
                        </div>
                      </TableCell>
                      <TableCell>{karyawan.nip}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {karyawan.divisi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {assessedKaryawanIds.has(karyawan.id) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 cursor-not-allowed"
                            disabled
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Sudah Dinilai
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSelectKaryawan(karyawan.id)}
                          >
                            Nilai
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="bg-slate-50/50 border-b pb-6 flex flex-row items-center gap-4 space-y-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setView("list");
            form.setValue("karyawanId", ""); // Optional: reset selection
          }}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <CardTitle className="text-xl">
            Penilaian:{" "}
            <span className="text-primary">{selectedKaryawan?.nama}</span>
          </CardTitle>
          <CardDescription>
            Divisi: {selectedKaryawan?.divisi} • NIP: {selectedKaryawan?.nip} •
            Periode:{" "}
            {
              [
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
              ][parseInt(selectedBulan)]
            }{" "}
            {selectedTahun}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* --- FORM DINAMIS (Kriteria) --- */}
            <div className="space-y-6 min-h-[200px]">
              {/* STATE: LOADING KRITERIA */}
              {isLoadingKriteria && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Memuat formulir kriteria...</p>
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
                                      render={({ field }) => {
                                        const options =
                                          (kriteria.jenis as string) === "COST"
                                            ? RATING_OPTIONS_COST
                                            : RATING_OPTIONS;

                                        return (
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
                                                      : "",
                                                  )}
                                                >
                                                  <SelectValue placeholder="Pilih Nilai" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent align="end">
                                                {options.map((opt) => (
                                                  <SelectItem
                                                    key={opt.value}
                                                    value={opt.value.toString()}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <span
                                                        className={cn(
                                                          "font-bold w-4",
                                                          opt.color,
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
                                        );
                                      }}
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
            <div className="pt-4 flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-1/3"
                onClick={() => setView("list")}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-2/3 font-semibold shadow-md transition-all active:scale-[0.98]"
                disabled={createMutation.isPending || !isFormReady}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
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
