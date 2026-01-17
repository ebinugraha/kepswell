"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Calculator, Trophy, FileDown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ListPenilaian = () => {
  const trpc = useTRPC();

  // State Filter
  const [bulan, setBulan] = useState<string>(new Date().getMonth().toString());
  const [tahun, setTahun] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [divisi, setDivisi] = useState<string>("HOST_LIVE"); // Default salah satu divisi

  // 1. Fetch Data Ranking
  const {
    data: listPenilaian,
    isLoading,
    refetch,
  } = useQuery(
    trpc.penilaian.getByPeriode.queryOptions({
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      divisi: divisi as any,
    })
  );

  // 2. Setup Mutation Hitung
  const hitungMutation = useMutation(
    trpc.penilaian.hitungRankingSmart.mutationOptions({
      onSuccess: (res) => {
        toast.success(res.message);
        refetch(); // Refresh tabel setelah hitung
      },
      onError: (err) => {
        toast.error("Gagal menghitung: " + err.message);
      },
    })
  );

  const handleHitung = () => {
    hitungMutation.mutate({
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      divisi: divisi as any,
    });
  };

  // Helper tahun
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="space-y-6">
      {/* --- FILTER & ACTION BAR --- */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Laporan & Perankingan</CardTitle>
          <CardDescription>
            Pilih periode dan divisi untuk melihat hasil perhitungan SMART.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Filter Divisi */}
            <div className="space-y-2 flex-1">
              <span className="text-sm font-medium">Divisi</span>
              <Select value={divisi} onValueChange={setDivisi}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOST_LIVE">Host Live</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="PRODUKSI">Produksi</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Bulan */}
            <div className="space-y-2 w-full md:w-40">
              <span className="text-sm font-medium">Bulan</span>
              <Select value={bulan} onValueChange={setBulan}>
                <SelectTrigger>
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
                  ].map((b, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Tahun */}
            <div className="space-y-2 w-full md:w-32">
              <span className="text-sm font-medium">Tahun</span>
              <Select value={tahun} onValueChange={setTahun}>
                <SelectTrigger>
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

            {/* Tombol Hitung */}
            <Button
              onClick={handleHitung}
              disabled={hitungMutation.isPending}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {hitungMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="mr-2 h-4 w-4" />
              )}
              Hitung Ranking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- TABEL HASIL --- */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Nama Karyawan</TableHead>
              <TableHead className="hidden md:table-cell">NIP</TableHead>
              <TableHead className="text-center">Total Nilai (SMART)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : listPenilaian?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>Belum ada data penilaian untuk periode ini.</p>
                    <p className="text-xs">
                      Silakan input penilaian terlebih dahulu.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              listPenilaian?.map((item, index) => {
                const nilai = item.nilaiAkhir ?? 0;
                // Logika sederhana status (bisa disesuaikan)
                const isTop3 = index < 3;

                return (
                  <TableRow
                    key={item.id}
                    className={isTop3 ? "bg-indigo-50/30" : ""}
                  >
                    <TableCell className="text-center font-bold text-slate-700">
                      {isTop3 ? (
                        <div className="flex justify-center items-center">
                          {index === 0 && (
                            <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                          )}
                          #{index + 1}
                        </div>
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.karyawan.nama}</div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {item.karyawan.nip}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.karyawan.nip}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.nilaiAkhir === null ? (
                        <span className="text-slate-400 italic text-xs">
                          Belum dihitung
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-700 text-lg">
                          {nilai.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {nilai >= 80 ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          Sangat Baik
                        </Badge>
                      ) : nilai >= 60 ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                          Baik
                        </Badge>
                      ) : (
                        <Badge variant="outline">Perlu Evaluasi</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
