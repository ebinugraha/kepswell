"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  Target,
  TrendingUp,
  UserPlus,
  FileChartColumn,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const DashboardView = () => {
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.dashboard.getStats.queryOptions()
  );

  // Helper untuk mendapatkan salam berdasarkan waktu
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const userRole = stats?.role || "GUEST";

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {greeting}, {userRole === "HRD" ? "HR Team" : "Manager"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Berikut adalah ringkasan aktivitas sistem penilaian kinerja hari
            ini.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-medium text-slate-600">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>
            Periode:{" "}
            {new Date().toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Karyawan"
          value={stats?.totalKaryawan ?? 0}
          icon={Users}
          desc="Aktif bekerja"
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Penilaian Bulan Ini"
          value={stats?.penilaianBulanIni ?? 0}
          icon={FileText}
          desc="Data masuk"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Total Kriteria"
          value={stats?.totalKriteria ?? 0}
          icon={Target}
          desc="Indikator SMART"
          color="bg-orange-50 text-orange-600"
        />
        <StatsCard
          title="Divisi Terbanyak"
          value={
            stats?.divisiStats.sort((a, b) => b.count - a.count)[0]?.count ?? 0
          }
          subValue={
            stats?.divisiStats.sort((a, b) => b.count - a.count)[0]?.name ?? "-"
          }
          icon={TrendingUp}
          desc="Karyawan"
          color="bg-indigo-50 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- MAIN CONTENT: QUICK ACTIONS --- */}
        <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
            <CardDescription>
              Pintasan menu yang sering digunakan berdasarkan role Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Menu HRD */}
            {(userRole === "HRD" || userRole === "MANAGER") && (
              <>
                <QuickAction
                  href="/penilaian"
                  title="Input Penilaian Baru"
                  desc="Masukkan skor kinerja bulanan karyawan."
                  icon={FileText}
                  variant="default"
                />
                <QuickAction
                  href="/karyawan"
                  title="Kelola Data Karyawan"
                  desc="Tambah atau update data pegawai."
                  icon={UserPlus}
                  variant="outline"
                />
              </>
            )}

            {/* Menu Manager */}
            {(userRole === "MANAGER" || userRole === "HRD") && (
              <>
                <QuickAction
                  href="/penilaian" // Atau halaman laporan jika ada
                  title="Laporan & Ranking"
                  desc="Lihat hasil kalkulasi metode SMART."
                  icon={FileChartColumn}
                  variant="outline"
                />
                <QuickAction
                  href="/kriteria"
                  title="Atur Bobot Kriteria"
                  desc="Sesuaikan indikator penilaian divisi."
                  icon={Target}
                  variant="outline"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* --- SIDEBAR CONTENT: DISTRIBUTION --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Sebaran Karyawan</CardTitle>
            <CardDescription>Distribusi per divisi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.divisiStats.map((div, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      [
                        "bg-blue-500",
                        "bg-purple-500",
                        "bg-orange-500",
                        "bg-slate-500",
                      ][i % 4]
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {div.name}
                  </span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {div.count}
                </Badge>
              </div>
            ))}

            {stats?.divisiStats.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Belum ada data divisi.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatsCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  desc,
  color,
}: any) => (
  <Card className="shadow-sm hover:shadow-md transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        {subValue && (
          <Badge variant="outline" className="text-xs uppercase">
            {subValue}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </CardContent>
  </Card>
);

const QuickAction = ({ href, title, desc, icon: Icon, variant }: any) => (
  <Link href={href}>
    <div
      className={`
      group flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer h-full
      ${
        variant === "default"
          ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
          : "bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
      }
    `}
    >
      <div
        className={`p-2 rounded-lg ${
          variant === "default"
            ? "bg-slate-800 text-indigo-400"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm flex items-center gap-1">
          {title}
          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </h4>
        <p
          className={`text-xs mt-1 ${
            variant === "default" ? "text-slate-400" : "text-muted-foreground"
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  </Link>
);

const DashboardSkeleton = () => (
  <div className="p-8 space-y-8">
    <div className="flex gap-4">
      <Skeleton className="h-10 w-64" />
    </div>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);
