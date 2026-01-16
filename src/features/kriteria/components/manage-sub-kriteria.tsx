"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  kriteriaId: string;
  subKriteriaInitial?: { id: string; nama: string; nilai: number }[];
}

export const ManageSubKriteria = ({
  kriteriaId,
  subKriteriaInitial = [],
}: Props) => {
  const trpc = useTRPC();
  const [nama, setNama] = useState("");
  const [nilai, setNilai] = useState("");

  // Mutation untuk tambah
  const createSub = useMutation(trpc.kriteria.createSub.mutationOptions());

  // Mutation untuk hapus
  const deleteSub = useMutation(trpc.kriteria.deleteSub.mutationOptions());

  const handleAdd = () => {
    if (!nama || !nilai) return;
    createSub.mutate({
      kriteriaId,
      nama,
      nilai: Number(nilai),
    });
  };

  return (
    <div className="space-y-4 mt-4 border rounded-md p-4 bg-gray-50 dark:bg-zinc-900">
      <h4 className="text-sm font-medium">Sub Kriteria (Opsi Penilaian)</h4>

      {/* List Sub Kriteria yang sudah ada */}
      <div className="space-y-2">
        {subKriteriaInitial.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Belum ada sub kriteria.
          </p>
        )}
        {subKriteriaInitial.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between text-sm bg-white dark:bg-zinc-800 p-2 rounded border"
          >
            <span>{sub.nama}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {sub.nilai}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => deleteSub.mutate({ id: sub.id })}
                disabled={deleteSub.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Input Baru */}
      <div className="flex gap-2 items-end">
        <div className="grid gap-1 flex-1">
          <Label className="text-xs">Label</Label>
          <Input
            placeholder="Contoh: Sangat Baik"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="grid gap-1 w-24">
          <Label className="text-xs">Nilai/Bobot</Label>
          <Input
            type="number"
            placeholder="100"
            value={nilai}
            onChange={(e) => setNilai(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Button
          size="icon"
          className="h-8 w-8"
          onClick={handleAdd}
          disabled={createSub.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
