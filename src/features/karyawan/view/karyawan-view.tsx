"use client";

import { useState } from "react";
import { CreateFilterCard } from "../components/create-filter";
import { KaryawanDialog } from "../components/karyawan-dialog";
import { TabelKaryawan } from "../components/table-karyawan";
import { useSuspenseKaryawan } from "../hooks/useKaryawan";

export const KaryawanView = () => {
  const [open, setOpen] = useState(false);

  const { data: listKaryawan } = useSuspenseKaryawan();

  return (
    <>
      <KaryawanDialog open={open} onOpenChange={setOpen} />
      <div className="p-4 flex flex-col gap-4">
        {/* Card Filter */}
        <CreateFilterCard onClick={() => setOpen((open) => !open)} />
        {/* Table Daftar Karyawan */}
        <TabelKaryawan karyawan={listKaryawan} />
      </div>
    </>
  );
};
