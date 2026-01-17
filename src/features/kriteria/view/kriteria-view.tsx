"use client";

import { useState } from "react";
import { Plus, Layers, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSuspenseKriteria } from "../hooks/use-kriteria";
import { KriteriaDialog } from "../components/kriteria-dialog";
import { TableKriteriaHostLive } from "../components/table-kriteria-hostlive";
import { TableKriteriaMarketing } from "../components/table-kriteria-marketing";
import { TableKriteriaAdmin } from "../components/table-kriteria-admin";
import { TableKriteriaProduksi } from "../components/table-kriteria-produksi";
import { Kriteria } from "../../../../prisma/generated/client";

export default function KriteriaView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectKriteria, setSelectKriteria] = useState<Kriteria | null>(null);

  // State untuk melacak tab aktif (agar nanti bisa auto-fill divisi saat create)
  const [activeTab, setActiveTab] = useState("MARKETING");

  const { data: kriteriaList } = useSuspenseKriteria();

  // Filter Data
  const kriteriaAdmin = kriteriaList.filter((k) => k.divisi === "ADMIN");
  const kriteriaProduksi = kriteriaList.filter((k) => k.divisi === "PRODUKSI");
  const kriteriaHostLive = kriteriaList.filter((k) => k.divisi === "HOST_LIVE");
  const kriteriaMarketing = kriteriaList.filter(
    (k) => k.divisi === "MARKETING"
  );

  // Handler untuk membuka Modal
  const handleCreate = () => {
    setSelectKriteria(null); // Reset state edit
    setIsOpen(true);
  };

  const handleEdit = (kriteria: Kriteria) => {
    setSelectKriteria(kriteria);
    setIsOpen(true);
  };

  return (
    <>
      <KriteriaDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        kriteria={selectKriteria}
        // Opsional: Anda bisa passing defaultDivisi={activeTab} ke dialog jika ingin auto-select
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Master Kriteria & Bobot
            </h1>
            <p className="text-muted-foreground text-sm">
              Atur indikator penilaian performa (KPI) untuk setiap divisi.
            </p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kriteria
          </Button>
        </div>

        {/* Content Section dengan Tabs */}
        <Tabs
          defaultValue="MARKETING"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 sm:pb-0">
            <TabsList className="h-11">
              <TabsTrigger value="MARKETING" className="px-6">
                Marketing ({kriteriaMarketing.length})
              </TabsTrigger>
              <TabsTrigger value="HOST_LIVE" className="px-6">
                Host Live ({kriteriaHostLive.length})
              </TabsTrigger>
              <TabsTrigger value="PRODUKSI" className="px-6">
                Produksi ({kriteriaProduksi.length})
              </TabsTrigger>
              <TabsTrigger value="ADMIN" className="px-6">
                Admin ({kriteriaAdmin.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Wrapper Card untuk setiap Tab Content */}
          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-medium">
                  Daftar Kriteria Divisi{" "}
                  {activeTab.replace("_", " ").toLowerCase()}
                </CardTitle>
              </div>
              <CardDescription>
                Klik pada baris tabel untuk mengedit bobot atau nama kriteria.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent
                value="MARKETING"
                className="m-0 border-none shadow-none"
              >
                <TableKriteriaMarketing
                  kriteriaList={kriteriaMarketing}
                  onClickKriteria={handleEdit}
                />
              </TabsContent>

              <TabsContent
                value="HOST_LIVE"
                className="m-0 border-none shadow-none"
              >
                <TableKriteriaHostLive
                  kriteriaList={kriteriaHostLive}
                  onClickKriteria={handleEdit}
                />
              </TabsContent>

              <TabsContent
                value="PRODUKSI"
                className="m-0 border-none shadow-none"
              >
                <TableKriteriaProduksi
                  kriteriaList={kriteriaProduksi}
                  onClickKriteria={handleEdit}
                />
              </TabsContent>

              <TabsContent
                value="ADMIN"
                className="m-0 border-none shadow-none"
              >
                <TableKriteriaAdmin
                  kriteriaList={kriteriaAdmin}
                  onClickKriteria={handleEdit}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </>
  );
}
