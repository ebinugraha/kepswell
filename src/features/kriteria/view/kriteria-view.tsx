"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  useKriteriaByDivisi,
  useSuspenseKriteria,
} from "../hooks/use-kriteria";
import { KriteriaDialog } from "../components/kriteria-dialog";
import { TableKriteriaHostLive } from "../components/table-kriteria-hostlive";
import { TableKriteriaMarketing } from "../components/table-kriteria-marketing";
import { TableKriteriaAdmin } from "../components/table-kriteria-admin";
import { TableKriteriaProduksi } from "../components/table-kriteria-produksi";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function KriteriaView() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: kriteriaList } = useSuspenseKriteria();

  const kriteriaAdmin = kriteriaList.filter((k) => k.divisi === "ADMIN");
  const kriteriaProduksi = kriteriaList.filter((k) => k.divisi === "PRODUKSI");
  const kriteriaHostLive = kriteriaList.filter((k) => k.divisi === "HOST_LIVE");
  const kriteriaMarketing = kriteriaList.filter(
    (k) => k.divisi === "MARKETING"
  );

  return (
    <>
      <KriteriaDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="space-y-6 p-6">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Master Kriteria
              </h1>
              <p className="text-muted-foreground">
                Kelola kriteria penilaian dan bobot untuk setiap divisi.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)} size={"sm"}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kriteria
          </Button>
        </div>

        <div className="flex gap-x-4">
          <TableKriteriaHostLive kriteriaList={kriteriaHostLive} />
          <TableKriteriaMarketing kriteriaList={kriteriaMarketing} />
          <TableKriteriaAdmin kriteriaList={kriteriaAdmin} />
          <TableKriteriaProduksi kriteriaList={kriteriaProduksi} />
        </div>
      </div>
    </>
  );
}
