"use client";

import { ClipboardCheck, BarChart3, Info, Trophy, Target } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { PenilaianForm } from "../components/penilaian-form";
import { ListPenilaian } from "../components/list-penilaian";

export const PenilaianView = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Evaluasi Kinerja (SMART Method)
        </h1>
        <p className="text-muted-foreground">
          Kelola penilaian bulanan karyawan dan hitung perankingan kinerja
          secara otomatis berdasarkan bobot kriteria.
        </p>
      </div>

      <Tabs defaultValue="input" className="w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between">
          <TabsList className="h-11 p-1 bg-muted/60">
            <TabsTrigger
              value="input"
              className="px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ClipboardCheck className="h-4 w-4" />
              Input Penilaian
            </TabsTrigger>
            <TabsTrigger
              value="laporan"
              className="px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Laporan & Ranking
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: INPUT PENILAIAN */}
        <TabsContent value="input" className="space-y-4 m-0">
          <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-12">
            {/* Sidebar Kiri: Informasi & Panduan */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              <Card className="bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Panduan Pengisian
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900/80 space-y-3">
                  <p>
                    Pastikan Anda memilih <strong>Divisi</strong> yang sesuai
                    sebelum memilih nama karyawan.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Nilai diinput berdasarkan Sub-Kriteria yang tersedia.
                    </li>
                    <li>
                      Sistem otomatis menolak jika karyawan sudah dinilai pada
                      periode (Bulan/Tahun) yang sama.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Area Utama: Form Input */}
            <div className="md:col-span-8 lg:col-span-9">
              <Card className="h-full border-t-4 border-t-primary shadow-sm">
                <CardContent>
                  <PenilaianForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LAPORAN & RANKING */}
        <TabsContent value="laporan" className="m-0">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laporan Hasil & Perankingan</CardTitle>
                  <CardDescription>
                    Daftar hasil perhitungan metode SMART. Klik tombol "Hitung
                    Ulang" jika ada perubahan data.
                  </CardDescription>
                </div>
                {/* Anda bisa memindahkan tombol Action/Export ke sini nanti */}
              </div>
            </CardHeader>
            <CardContent>
              <ListPenilaian />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
