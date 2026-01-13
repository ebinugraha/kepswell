"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PenilaianInput, penilaianSchema } from "../schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react"; // Tambah loader
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCreatePenilaian } from "../hooks/use-penilaian";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePenilaianStore } from "../hooks/use-penilaian-store";
import { useEffect } from "react";

const KRITERIA = [
  {
    id: "kualitas",
    label: "C1 - Kualitas Kerja",
    desc: "Akurasi dan kerapihan hasil kerja",
  },
  {
    id: "kuantitas",
    label: "C2 - Kuantitas Kerja",
    desc: "Volume hasil kerja dibandingkan target",
  },
  {
    id: "kedisiplinan",
    label: "C3 - Kedisiplinan",
    desc: "Ketaatan pada jam kerja dan aturan",
  },
  {
    id: "sikap",
    label: "C4 - Sikap Kerja",
    desc: "Etika dan kerjasama dalam tim",
  },
] as const; // Gunakan as const agar type-safe

const BULAN = [
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
];

const TAHUN = ["2024", "2025", "2026"];

export function PenilaianForm() {
  const { selectedData } = usePenilaianStore();
  const trpc = useTRPC();
  const createPenilaian = useCreatePenilaian();

  const form = useForm<PenilaianInput>({
    resolver: zodResolver(penilaianSchema),
    defaultValues: {
      kualitas: 75,
      kuantitas: 75,
      kedisiplinan: 75,
      sikap: 75,
      // Pastikan format bulan sesuai dengan isi array BULAN
      bulan: BULAN[new Date().getMonth()],
      tahun: new Date().getFullYear().toString(),
      karyawanId: "",
    },
  });

  const selectedKaryawan = form.watch("karyawanId");
  const selectedBulan = form.watch("bulan");
  const selectedTahun = form.watch("tahun");

  // Perbaikan Query: pastikan query tidak jalan jika data belum lengkap
  const { data: isAlreadyAssessed, isLoading: checkingStatus } = useQuery(
    trpc.penilaian.checkStatus.queryOptions(
      {
        bulan: selectedBulan,
        tahun: selectedTahun,
        karyawanId: selectedKaryawan,
      },
      { enabled: !!selectedKaryawan && !!selectedBulan && !!selectedTahun }
    )
  );

  const { data: karyawanList, isLoading: loadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions()
  );

  // Efek Auto-fill saat data di tabel diklik
  useEffect(() => {
    if (selectedData) {
      form.setValue("karyawanId", selectedData.karyawanId);
      form.setValue("bulan", selectedData.bulan);
      form.setValue("tahun", selectedData.tahun);
      form.setValue("kualitas", selectedData.kualitas);
      form.setValue("kuantitas", selectedData.kuantitas);
      form.setValue("kedisiplinan", selectedData.kedisiplinan);
      form.setValue("sikap", selectedData.sikap);
      // Trigger validasi agar pesan error hilang
      form.trigger();
    }
  }, [selectedData, form]);

  function onSubmit(data: PenilaianInput) {
    if (isAlreadyAssessed) {
      toast.error("Data untuk periode ini sudah ada.");
      return;
    }

    createPenilaian.mutate(data, {
      onSuccess: () => {
        toast.success("Penilaian berhasil disimpan");
        form.reset({
          ...form.getValues(),
          karyawanId: "", // Reset pilihan karyawan saja
        });
      },
      onError: (err) => {
        toast.error(err.message || "Gagal menyimpan data");
      },
    });
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
        <CardTitle>Form Penilaian</CardTitle>
        <Badge variant={isAlreadyAssessed ? "destructive" : "outline"}>
          {checkingStatus
            ? "Checking..."
            : isAlreadyAssessed
            ? "Sudah Dinilai"
            : "Tersedia"}
        </Badge>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Pilih Karyawan */}
              <div className="flex flex-col gap-y-3">
                <FormField
                  control={form.control}
                  name="karyawanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karyawan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingKaryawan}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                loadingKaryawan
                                  ? "Memuat data..."
                                  : "Pilih Karyawan"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {karyawanList?.map((karyawan) => (
                            <SelectItem key={karyawan.id} value={karyawan.id}>
                              {karyawan.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAlreadyAssessed && (
                  <Alert variant="destructive">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Periode Terkunci</AlertTitle>
                    <AlertDescription>
                      Karyawan ini sudah dinilai pada periode {selectedBulan}{" "}
                      {selectedTahun}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Pilih Periode */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bulan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bulan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-auto">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BULAN.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TAHUN.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bagian Input Nilai */}
            <div
              className={cn(
                "space-y-10 pt-4",
                isAlreadyAssessed && "opacity-40 pointer-events-none"
              )}
            >
              {KRITERIA.map((k) => (
                <FormField
                  key={k.id}
                  control={form.control}
                  name={k.id as any}
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-bold text-slate-800">
                            {k.label}
                          </FormLabel>
                          <FormDescription>{k.desc}</FormDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-sm px-3 py-1 font-mono"
                        >
                          {field.value}%
                        </Badge>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]} // Gunakan value, bukan defaultValue agar sinkron saat reset
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isAlreadyAssessed || createPenilaian.isPending}
              className="w-full font-semibold"
            >
              {createPenilaian.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAlreadyAssessed ? "Data Sudah Ada" : "Simpan Penilaian"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
