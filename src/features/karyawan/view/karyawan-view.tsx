"use client";

import { useState } from "react";
import { CreateFilterCard } from "../components/create-filter";
import { KaryawanDialog } from "../components/karyawan-dialog";
import { TabelKaryawan } from "../components/table-karyawan";
import { useSuspenseKaryawan } from "../hooks/useKaryawan";
import { Karyawan } from "../../../../prisma/generated/client";
import { Target, Users2Icon } from "lucide-react";

export const KaryawanView = () => {
  const [open, setOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(
    null,
  );

  const { data: listKaryawan } = useSuspenseKaryawan();

  return (
    <>
      <KaryawanDialog
        open={open}
        onOpenChange={setOpen}
        karyawan={selectedKaryawan}
      />
      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users2Icon className="h-6 w-6 text-blue-500" />
              Kelola Karyawan
            </h1>
            <p className="text-muted-foreground text-sm">
              Tambah, edit, dan kelola data karyawan toko Kepswell Anda disini.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Card Filter */}
          <CreateFilterCard onClick={() => setOpen((open) => !open)} />
          {/* Table Daftar Karyawan */}
        </div>
        <TabelKaryawan
          karyawan={listKaryawan}
          onClickEdit={(karyawan) => {
            setSelectedKaryawan(karyawan);
            setOpen(true);
          }}
        />
      </div>
    </>
  );
};
