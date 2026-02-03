"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LayoutList,
  Loader2,
  Search,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator"; // Pastikan sudah install separator
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Opsional: Untuk search filter
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useCreatePenilaian } from "../hooks/use-penilaian";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ScoringOption } from "./scoring-options"; // Sesuaikan nama file kamu

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

  // State Filter
  const [selectedDivisi, setSelectedDivisi] = useState<string>("HOST_LIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBulan, setSelectedBulan] = useState<string>(
    new Date().getMonth().toString(),
  );
  const [selectedTahun, setSelectedTahun] = useState<string>(
    new Date().getFullYear().toString(),
  );

  // Form Setup
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

  // Computed Values
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const isFormReady = detailSkorValues.length > 0;

  // 1. Fetch Data
  const { data: listKaryawan, isLoading: isLoadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions(),
  );

  const selectedKaryawan = listKaryawan?.find(
    (k) => k.id === selectedKaryawanId,
  );

  // Filter Logic
  const filteredKaryawan = useMemo(() => {
    if (!listKaryawan) return [];
    let result = listKaryawan;

    // Filter by Divisi
    if (selectedDivisi !== "ALL") {
      result = result.filter((k) => k.divisi === selectedDivisi);
    }

    // Filter by Search Query (Nama/NIP)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (k) =>
          k.nama.toLowerCase().includes(lowerQuery) ||
          k.nip.toLowerCase().includes(lowerQuery),
      );
    }
    return result;
  }, [listKaryawan, selectedDivisi, searchQuery]);

  const availableDivisions = useMemo(() => {
    const divs = new Set(DIVISIONS);
    if (listKaryawan) {
      listKaryawan.forEach((k) => {
        if (k.divisi) divs.add(k.divisi);
      });
    }
    return Array.from(divs);
  }, [listKaryawan]);

  // 2. Fetch Kriteria
  const { data: listKriteria, isLoading: isLoadingKriteria } = useQuery(
    trpc.kriteria.getByDivisi.queryOptions(
      { divisi: selectedKaryawan?.divisi as any },
      { enabled: !!selectedKaryawan?.divisi },
    ),
  );

  // 3. Fetch Existing Penilaian Status
  const { data: listPenilaian } = useQuery(
    trpc.penilaian.getByPeriode.queryOptions({
      bulan: parseInt(selectedBulan),
      tahun: parseInt(selectedTahun),
      divisi: selectedDivisi === "ALL" ? undefined : (selectedDivisi as any),
    }),
  );

  const assessedKaryawanIds = useMemo(() => {
    if (!listPenilaian) return new Set<string>();
    return new Set(listPenilaian.map((p) => p.karyawanId));
  }, [listPenilaian]);

  const subKriteriaIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (detailSkorValues) {
      detailSkorValues.forEach((item, index) => {
        if (item.subKriteriaId) map[item.subKriteriaId] = index;
      });
    }
    return map;
  }, [detailSkorValues]);

  // Handle Selection
  const handleSelectKaryawan = (karyawanId: string) => {
    form.setValue("karyawanId", karyawanId);
    form.setValue("bulan", selectedBulan);
    form.setValue("tahun", selectedTahun);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto Populate Form
  useEffect(() => {
    if (listKriteria && listKriteria.length > 0) {
      const initialValues: any[] = [];
      listKriteria.forEach((k) => {
        k.subKriteria.forEach((sub) => {
          initialValues.push({
            subKriteriaId: sub.id,
            kriteriaId: k.id,
            namaSubKriteria: sub.nama,
            nilai: "",
          });
        });
      });
      form.setValue("detailSkor", initialValues);
    } else {
      if (selectedKaryawanId && !isLoadingKriteria) {
        form.setValue("detailSkor", []);
      }
    }
  }, [listKriteria, form.setValue, selectedKaryawanId, isLoadingKriteria]);

  // Submit
  const onSubmit = (values: FormValues) => {
    if (values.detailSkor.length === 0) return;

    if (values.detailSkor.some((s) => !s.nilai)) {
      toast.error("Form Belum Lengkap", {
        description: "Harap isi semua penilaian sebelum menyimpan.",
      });
      // Scroll to error? (Optional implementation)
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
          setView("list");
          toast.success("Berhasil Disimpan", {
            description: `Penilaian untuk ${selectedKaryawan?.nama} telah disimpan.`,
          });
        },
      },
    );
  };

  // Progress Calculation
  const totalQuestions = detailSkorValues.length;
  const answeredQuestions = detailSkorValues.filter(
    (s) => s.nilai !== "",
  ).length;
  const progressPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((answeredQuestions / totalQuestions) * 100);

  // --- VIEW 1: LIST KARYAWAN ---
  if (view === "list") {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Penilaian Kinerja
            </h2>
            <p className="text-muted-foreground">
              Pilih karyawan untuk memulai penilaian periode ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedBulan} onValueChange={setSelectedBulan}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue />
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
                  <SelectItem key={i} value={i.toString()}>
                    {bln}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTahun} onValueChange={setSelectedTahun}>
              <SelectTrigger className="w-[100px] bg-background">
                <SelectValue />
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

        {/* Filter Bar */}
        <Card className="border-none shadow-sm bg-muted/40">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIP..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="flex gap-2">
                <Button
                  variant={selectedDivisi === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDivisi("ALL")}
                  className="rounded-full"
                >
                  Semua
                </Button>
                {availableDivisions.map((div) => (
                  <Button
                    key={div}
                    variant={selectedDivisi === div ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDivisi(div)}
                    className="rounded-full"
                  >
                    {DIVISION_LABELS[div] || div}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Content */}
        <Card>
          <CardContent className="p-0">
            {isLoadingKaryawan ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p>Memuat data karyawan...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKaryawan.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Tidak ada data yang sesuai filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKaryawan.map((karyawan, i) => {
                      const isDone = assessedKaryawanIds.has(karyawan.id);
                      return (
                        <TableRow
                          key={karyawan.id}
                          className="group cursor-pointer hover:bg-muted/30"
                        >
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                {karyawan.nama.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium group-hover:text-primary transition-colors">
                                  {karyawan.nama}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {karyawan.nip}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-normal text-xs px-2.5 py-0.5"
                            >
                              {DIVISION_LABELS[karyawan.divisi as string] ||
                                karyawan.divisi}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isDone ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Selesai
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSelectKaryawan(karyawan.id)
                                }
                                variant={"outline"}
                              >
                                Mulai Penilaian{" "}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: FORM PENILAIAN ---
  const currentMonthName = [
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
  ][parseInt(selectedBulan)];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b mb-8 shadow-sm transition-all">
        <div className="container mx-auto py-4 px-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Formulir Penilaian
                </h2>
                <p className="font-bold text-lg leading-none">
                  {selectedKaryawan?.nama}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary tabular-nums">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2 w-full" />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="px-2 md:px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Loading State */}
            {isLoadingKriteria && (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-lg">Sedang menyiapkan formulir...</p>
              </div>
            )}

            {/* Form Content */}
            {!isLoadingKriteria && selectedKaryawanId && listKriteria && (
              <div className="space-y-10">
                {listKriteria.length === 0 ? (
                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Konfigurasi Belum Tersedia</AlertTitle>
                    <AlertDescription>
                      Belum ada kriteria penilaian yang diatur untuk divisi{" "}
                      <strong>{selectedKaryawan?.divisi}</strong>. Hubungi
                      admin.
                    </AlertDescription>
                  </Alert>
                ) : (
                  // MAP SETIAP KRITERIA SEBAGAI SATU SECTION BESAR
                  listKriteria.map((kriteria, index) => (
                    <Card
                      key={kriteria.id}
                      className="overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="bg-slate-50 border-b pb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                              {index + 1}
                            </span>
                            <div>
                              <CardTitle className="text-xl">
                                {kriteria.nama}
                              </CardTitle>
                              <CardDescription>
                                Berikan penilaian objektif berdasarkan kinerja.
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            Bobot: {kriteria.bobot}%
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        {/* LIST SUB-KRITERIA (PERTANYAAN) */}
                        <div className="divide-y">
                          {kriteria.subKriteria.map((sub, subIndex) => {
                            const fieldIndex = subKriteriaIndexMap[sub.id];
                            if (fieldIndex === undefined) return null;

                            return (
                              <div
                                key={sub.id}
                                className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors"
                              >
                                <div className="mb-6">
                                  <h4 className="text-base font-semibold text-slate-900 mb-1 flex gap-2">
                                    <span className="text-muted-foreground font-normal">
                                      {index + 1}.{subIndex + 1}
                                    </span>
                                    {sub.nama}
                                  </h4>
                                  <p className="text-sm text-muted-foreground pl-8">
                                    Pilih skor yang paling merepresentasikan
                                    kinerja karyawan untuk poin ini.
                                  </p>
                                </div>

                                {/* SCORING OPTIONS GRID */}
                                <FormField
                                  control={form.control}
                                  name={`detailSkor.${fieldIndex}.nilai`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-0 pl-0 md:pl-8">
                                      <FormControl>
                                        {sub.opsi.length > 0 ? (
                                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {sub.opsi
                                              .sort((a, b) => a.skor - b.skor)
                                              .map((opt) => (
                                                <ScoringOption
                                                  key={opt.id}
                                                  value={opt.skor}
                                                  label={opt.label}
                                                  isSelected={
                                                    field.value ===
                                                    opt.skor.toString()
                                                  }
                                                  onClick={() =>
                                                    field.onChange(
                                                      opt.skor.toString(),
                                                    )
                                                  }
                                                />
                                              ))}
                                          </div>
                                        ) : (
                                          <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                              Opsi nilai tidak ditemukan. Cek
                                              data master.
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t z-50">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div className="hidden md:block text-sm text-muted-foreground">
                  Periode:{" "}
                  <span className="font-medium text-foreground">
                    {currentMonthName} {selectedTahun}
                  </span>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 md:w-32"
                    onClick={() => setView("list")}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 md:w-48 shadow-lg shadow-primary/20"
                    disabled={
                      createMutation.isPending ||
                      !isFormReady ||
                      progressPercentage < 100
                    }
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : progressPercentage < 100 ? (
                      `Selesaikan (${answeredQuestions}/${totalQuestions})`
                    ) : (
                      "Simpan Penilaian"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
