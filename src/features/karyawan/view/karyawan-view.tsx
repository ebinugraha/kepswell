"use client";

import { useState } from "react";
import { CreateFilterCard } from "../components/create-filter";
import { KaryawanDialog } from "../components/karyawan-dialog";
import { TabelKaryawan } from "../components/table-karyawan";
import { useSuspenseKaryawan } from "../hooks/useKaryawan";
import { Karyawan } from "../../../../prisma/generated/client";

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
      <div className="p-4 flex flex-col gap-4">
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
    </>
  );
};
