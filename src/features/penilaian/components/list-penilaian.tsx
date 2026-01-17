"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Calculator,
  Trophy,
  FileDown,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

// Helper: Nama Bulan
const NAMA_BULAN = [
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

export const ListPenilaian = () => {
  const trpc = useTRPC();

  // State Filter
  const [bulan, setBulan] = useState<string>(new Date().getMonth().toString());
  const [tahun, setTahun] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [divisi, setDivisi] = useState<string>("HOST_LIVE");

  // Fetch Data
  const {
    data: listPenilaian,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(
    trpc.penilaian.getByPeriode.queryOptions({
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      divisi: divisi as any,
    })
  );

  // Hitung Ranking Mutation
  const hitungMutation = useMutation(
    trpc.penilaian.hitungRankingSmart.mutationOptions({
      onSuccess: (res) => {
        toast.success("Perhitungan Selesai!", {
          description: res.message,
        });
        refetch();
      },
      onError: (err) => {
        toast.error("Gagal menghitung", {
          description: err.message,
        });
      },
    })
  );

  // Helper Hitung Statistik Sederhana
  const stats = listPenilaian
    ? {
        total: listPenilaian.length,
        avg:
          listPenilaian.reduce((acc, curr) => acc + (curr.nilaiAkhir || 0), 0) /
          (listPenilaian.length || 1),
        max: Math.max(...listPenilaian.map((p) => p.nilaiAkhir || 0)),
      }
    : { total: 0, avg: 0, max: 0 };

  const handleHitung = () => {
    hitungMutation.mutate({
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      divisi: divisi as any,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* --- BAGIAN 1: STATISTIK RINGKAS (DASHBOARD MINI) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Dinilai
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.total}{" "}
                <span className="text-sm font-normal text-slate-500">
                  Karyawan
                </span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nilai Tertinggi
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.max > 0 ? stats.max.toFixed(2) : "-"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50/50 border-indigo-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Rata-rata Nilai
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.avg > 0 ? stats.avg.toFixed(2) : "-"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- BAGIAN 2: FILTER & CONTROL PANEL --- */}
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Laporan Ranking Kinerja</CardTitle>
              <CardDescription>
                Hasil perhitungan metode SMART untuk periode{" "}
                {NAMA_BULAN[parseInt(bulan)]} {tahun}.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export Laporan
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col xl:flex-row gap-4 xl:items-end bg-slate-50/50 p-4 rounded-lg border">
            {/* Filter Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Divisi
                </span>
                <Select value={divisi} onValueChange={setDivisi}>
                  <SelectTrigger className="bg-white">
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

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Bulan
                </span>
                <Select value={bulan} onValueChange={setBulan}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NAMA_BULAN.map((b, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Tahun
                </span>
                <Select value={tahun} onValueChange={setTahun}>
                  <SelectTrigger className="bg-white">
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

            <Separator
              orientation="vertical"
              className="hidden xl:block h-12"
            />

            {/* Action Button */}
            <Button
              onClick={handleHitung}
              disabled={hitungMutation.isPending || isLoading}
              size="lg"
              className="w-full xl:w-auto min-w-[180px] bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              {hitungMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghitung...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Hitung Ulang Ranking
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- BAGIAN 3: TABEL DATA --- */}
      <Card className="overflow-hidden shadow-sm">
        <div className="relative">
          {(isLoading || isRefetching) && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-20 text-center font-bold text-slate-700">
                  Peringkat
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Nama Karyawan
                </TableHead>
                <TableHead className="hidden md:table-cell font-bold text-slate-700">
                  NIP
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700">
                  Skor Akhir (SMART)
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700">
                  Kategori
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listPenilaian?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                      <FileDown className="h-10 w-10" />
                      <p className="font-medium">Data tidak ditemukan</p>
                      <p className="text-xs">
                        Belum ada penilaian masuk untuk periode ini.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                listPenilaian?.map((item, index) => {
                  const nilai = item.nilaiAkhir ?? 0;
                  const rank = index + 1;

                  // Style Khusus Top 3
                  let rowClass = "hover:bg-slate-50 transition-colors";
                  let rankBadge = (
                    <span className="font-mono font-medium text-slate-500">
                      #{rank}
                    </span>
                  );

                  if (rank === 1) {
                    rowClass = "bg-yellow-50/50 hover:bg-yellow-50";
                    rankBadge = (
                      <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-200 mx-auto drop-shadow-sm" />
                    );
                  } else if (rank === 2) {
                    rowClass = "bg-slate-50/50 hover:bg-slate-100";
                    rankBadge = (
                      <Trophy className="h-5 w-5 text-slate-400 fill-slate-200 mx-auto" />
                    );
                  } else if (rank === 3) {
                    rowClass = "bg-orange-50/30 hover:bg-orange-50";
                    rankBadge = (
                      <Trophy className="h-5 w-5 text-orange-400 fill-orange-200 mx-auto" />
                    );
                  }

                  return (
                    <TableRow key={item.id} className={rowClass}>
                      <TableCell className="text-center py-4">
                        {rankBadge}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-base">
                            {item.karyawan.nama}
                          </span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {item.karyawan.nip}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                        {item.karyawan.nip}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.nilaiAkhir === null ? (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs">
                            Belum Hitung
                          </span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-indigo-700 tracking-tight">
                              {nilai.toFixed(2)}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(nilai, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {nilai >= 85 ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 px-3 py-1">
                            Sangat Baik
                          </Badge>
                        ) : nilai >= 70 ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1">
                            Baik
                          </Badge>
                        ) : nilai >= 50 ? (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 px-3 py-1">
                            Cukup
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="px-3 py-1">
                            Kurang
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
