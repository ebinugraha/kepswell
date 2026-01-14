"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formSchemaPenilaian } from "../schema";
import { useCreatePenilaian } from "../hooks/use-penilaian";
import { useSuspenseKaryawan } from "@/features/karyawan/hooks/useKaryawan";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

// --- SCHEMA VALIDASI ---
// Schema ini dinamis, menerima array nilai berdasarkan kriteria yang aktif

type FormValues = z.infer<typeof formSchemaPenilaian>;

export const PenilaianForm = () => {
  const trpc = useTRPC();

  const createMutation = useCreatePenilaian();

  // 1. Setup Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaPenilaian),
    defaultValues: {
      karyawanId: "",
      bulan: new Date().getMonth().toString(), // Default bulan ini (0-11)
      tahun: new Date().getFullYear().toString(),
      detailSkor: [],
    },
  });

  // 2. Watchers
  const selectedKaryawanId = form.watch("karyawanId");
  const detailSkorFields = form.watch("detailSkor");

  // 3. Fetch Data Karyawan (Untuk Dropdown & Cek Divisi)
  // Asumsi: Anda sudah punya router trpc.karyawan.getAll atau getOptions
  const { data: listKaryawan, isLoading: isLoadingKaryawan } = useQuery(
    trpc.karyawan.getAll.queryOptions()
  );

  // Catatan: Pastikan di router karyawan ada procedure 'getOptions' atau 'getAll'

  // Ambil data detail karyawan yang dipilih untuk mengetahui Divisinya
  const selectedKaryawan = listKaryawan?.find(
    (k) => k.id === selectedKaryawanId
  );

  const { data: listKriteria, isLoading: isLoadingKriteria } = useQuery(
    trpc.kriteria.getByDivisi.queryOptions({
      divisi: selectedKaryawan?.divisi as any,
    })
  );

  // 5. Effect: Reset/Update Field Input saat Kriteria Berubah
  useEffect(() => {
    if (listKriteria && listKriteria.length > 0) {
      // Mapping kriteria dari DB ke format form
      const initialSkor = listKriteria.map((k) => ({
        kriteriaId: k.id,
        namaKriteria: k.nama,
        nilai: 0,
      }));
      form.setValue("detailSkor", initialSkor);
    } else {
      // Jika tidak ada kriteria (atau ganti user), kosongkan
      form.setValue("detailSkor", []);
    }
  }, [listKriteria, form.setValue]);

  // 6. Mutation: Simpan Penilaian

  const onSubmit = (values: FormValues) => {
    // Pastikan ada input nilai
    if (values.detailSkor.length === 0) {
      toast.error(
        "Tidak ada kriteria penilaian untuk divisi ini. Hubungi Admin."
      );
      return;
    }

    createMutation.mutate({
      karyawanId: values.karyawanId,
      bulan: parseInt(values.bulan),
      tahun: parseInt(values.tahun),
      // Kirim hanya data yang dibutuhkan backend
      detailSkor: values.detailSkor.map((s) => ({
        kriteriaId: s.kriteriaId,
        nilai: s.nilai,
      })),
    });
  };

  // Helper untuk tahun dropdown (5 tahun ke belakang)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Input Penilaian Kinerja</CardTitle>
        <CardDescription>
          Form penilaian otomatis menyesuaikan kriteria berdasarkan divisi
          karyawan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* --- SEKSI IDENTITAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="karyawanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Karyawan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingKaryawan}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cari nama karyawan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {listKaryawan?.map((k) => (
                          <SelectItem key={k.id} value={k.id}>
                            {k.nama} - {k.divisi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
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
                          <SelectItem value="0">Januari</SelectItem>
                          <SelectItem value="1">Februari</SelectItem>
                          <SelectItem value="2">Maret</SelectItem>
                          <SelectItem value="3">April</SelectItem>
                          <SelectItem value="4">Mei</SelectItem>
                          <SelectItem value="5">Juni</SelectItem>
                          <SelectItem value="6">Juli</SelectItem>
                          <SelectItem value="7">Agustus</SelectItem>
                          <SelectItem value="8">September</SelectItem>
                          <SelectItem value="9">Oktober</SelectItem>
                          <SelectItem value="10">November</SelectItem>
                          <SelectItem value="11">Desember</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tahun"
                  render={({ field }) => (
                    <FormItem className="w-24">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* --- SEKSI FORM DINAMIS --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Kriteria Penilaian (
                {selectedKaryawan ? selectedKaryawan.divisi : "-"})
              </h3>

              {isLoadingKriteria ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat kriteria divisi...
                </div>
              ) : !selectedKaryawanId ? (
                <div className="text-sm text-muted-foreground italic py-4">
                  Silakan pilih karyawan terlebih dahulu untuk memunculkan form
                  penilaian.
                </div>
              ) : detailSkorFields.length === 0 ? (
                <div className="p-4 border border-dashed rounded-md text-center text-sm text-yellow-600 bg-yellow-50">
                  Belum ada kriteria yang diatur untuk divisi{" "}
                  <strong>{selectedKaryawan?.divisi}</strong>.
                  <br />
                  Silakan minta Admin untuk input Master Kriteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Mapping input berdasarkan kriteria yang didapat */}
                  {detailSkorFields.map((item, index) => (
                    <FormField
                      key={item.kriteriaId}
                      control={form.control}
                      name={`detailSkor.${index}.nilai`}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between border p-3 rounded-lg bg-slate-50/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {item.namaKriteria}
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Masukkan nilai (0 - 100)
                            </p>
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              max={100}
                              className="w-24 text-right font-medium"
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                createMutation.isPending || detailSkorFields.length === 0
              }
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Penilaian
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
