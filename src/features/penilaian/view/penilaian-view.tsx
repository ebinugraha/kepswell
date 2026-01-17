"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenilaianForm } from "../components/penilaian-form";
import { ListPenilaian } from "../components/list-penilaian";

export const PenilaianView = () => {
  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Evaluasi Kinerja (SMART)
        </h1>
        <p className="text-muted-foreground">
          Kelola penilaian karyawan dan hitung perankingan kinerja secara
          otomatis.
        </p>
      </div>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="input">Input Penilaian</TabsTrigger>
          <TabsTrigger value="laporan">Laporan & Ranking</TabsTrigger>
        </TabsList>

        {/* Tab 1: Form Input */}
        <TabsContent value="input">
          <PenilaianForm />
        </TabsContent>

        {/* Tab 2: Tabel Hasil & Hitung */}
        <TabsContent value="laporan">
          <ListPenilaian />
        </TabsContent>
      </Tabs>
    </div>
  );
};
