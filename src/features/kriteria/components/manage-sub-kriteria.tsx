"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, ListTree, Loader2, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateSubkriteria,
  useDeleteSubkriteria,
  useSuspenseSubkriteria,
} from "../hooks/use-kriteria";
import { cn } from "@/lib/utils";

interface Props {
  kriteriaId: string;
  subKriteriaInitial?: { id: string; nama: string; nilai: number }[];
}

const ManageOpsiJawaban = ({ subKriteriaId }: { subKriteriaId: string }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [label, setLabel] = useState("");
  const [skor, setSkor] = useState<string>("0");

  // 1. Query Data Opsi
  const { data: listOpsi, isLoading } = useQuery(
    trpc.kriteria.getOpsiBySub.queryOptions({
      subKriteriaId,
    }),
  );

  // 2. Mutation Tambah Opsi
  const createOpsi = useMutation(
    trpc.kriteria.createOpsi.mutationOptions({
      onSuccess: () => {
        setLabel("");
        setSkor("0");
        queryClient.invalidateQueries(
          trpc.kriteria.getOpsiBySub.queryOptions({ subKriteriaId }),
        );
        toast.success("Opsi jawaban berhasil ditambahkan");
      },
      onError: (err) => toast.error(`Gagal menambah opsi: ${err.message}`),
    }),
  );

  // 3. Mutation Hapus Opsi
  const deleteOpsi = useMutation(
    trpc.kriteria.deleteOpsi.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kriteria.getOpsiBySub.queryOptions({ subKriteriaId }),
        );
        toast.success("Opsi jawaban berhasil dihapus");
      },
      onError: (err) => toast.error(`Gagal menghapus opsi: ${err.message}`),
    }),
  );

  const handleAdd = () => {
    if (!label) return toast.error("Label jawaban wajib diisi");
    if (!skor) return toast.error("Nilai skor wajib diisi");

    createOpsi.mutate({
      subKriteriaId,
      label,
      skor: parseFloat(skor),
    });
  };

  return (
    <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20 space-y-3 pb-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 text-primary">
        <ListTree className="h-3.5 w-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-widest">
          Atur Pilihan Jawaban
        </span>
      </div>

      {/* --- LIST OPSI --- */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Memuat data opsi...
          </div>
        ) : listOpsi?.length === 0 ? (
          <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded border border-dashed text-center">
            <p className="text-[11px] italic text-muted-foreground">
              Belum ada pilihan jawaban. Silakan tambah di bawah.
            </p>
          </div>
        ) : (
          listOpsi?.map((opsi) => (
            <div
              key={opsi.id}
              className="flex items-center justify-between bg-white dark:bg-zinc-800 p-2 rounded border shadow-sm text-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center h-8 w-10 bg-primary/5 text-primary font-bold rounded border border-primary/10">
                  <span className="text-[10px] uppercase text-muted-foreground leading-none mb-0.5">
                    Poin
                  </span>
                  <span className="text-sm leading-none">{opsi.skor}</span>
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {opsi.label}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 hover:bg-red-50"
                onClick={() => deleteOpsi.mutate({ id: opsi.id })}
                disabled={deleteOpsi.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* --- FORM TAMBAH OPSI --- */}
      <div className="flex gap-2 items-end bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
        <div className="grid gap-1.5 flex-1">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">
            Label Jawaban
          </Label>
          <Input
            placeholder="Contoh: Terlambat > 5 kali"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-8 text-xs bg-white"
          />
        </div>
        <div className="grid gap-1.5 w-20">
          <Label className="text-[10px] font-bold text-slate-500 uppercase">
            Poin
          </Label>
          <Input
            type="number"
            placeholder="1-5"
            min={1} // Atribut HTML5 untuk aksesibilitas/validasi browser
            max={5}
            value={skor}
            onChange={(e) => {
              const val = e.target.value;

              // 1. Izinkan kosong agar user bisa menghapus angka
              if (val === "") {
                setSkor("");
                return;
              }

              // 2. Parse input ke angka
              const num = parseFloat(val);

              // 3. Hanya update state jika angka valid (1 <= num <= 5)
              if (!isNaN(num) && num >= 1 && num <= 5) {
                setSkor(val);
              }
              // Jika angka diluar range (misal 0, 6, 10), input akan diabaikan (tidak berubah)
            }}
            className="h-8 text-xs bg-white text-center font-mono"
          />
        </div>
        <Button
          size="sm"
          className="h-8 shadow-sm"
          onClick={handleAdd}
          disabled={createOpsi.isPending}
        >
          {createOpsi.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const ManageSubKriteria = ({ kriteriaId }: Props) => {
  const [nama, setNama] = useState("");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Menggunakan hooks custom yang sudah Anda buat sebelumnya
  const subKriteria = useSuspenseSubkriteria({ kriteriaId });
  const createSub = useCreateSubkriteria();
  const deleteSub = useDeleteSubkriteria();

  const handleAddSub = () => {
    if (!nama.trim())
      return toast.error("Nama sub kriteria tidak boleh kosong");

    createSub.mutate(
      { kriteriaId, nama },
      {
        onSuccess: () => {
          setNama("");
          toast.success("Sub kriteria berhasil dibuat");
        },
      },
    );
  };

  return (
    <div className="space-y-6 mt-6 border rounded-xl p-6 bg-slate-50/40 dark:bg-zinc-900/20 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            Daftar Pertanyaan (Sub-Kriteria)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola pertanyaan penilaian dan opsi jawabannya di sini.
          </p>
        </div>
      </div>

      {/* --- LIST SUB KRITERIA --- */}
      <div className="space-y-3">
        {subKriteria.data?.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-xl bg-white/50">
            <p className="text-sm text-muted-foreground">
              Belum ada pertanyaan.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mulai dengan menambahkan pertanyaan baru di bawah.
            </p>
          </div>
        ) : (
          subKriteria.data?.map((sub) => {
            const isExpanded = expandedSubId === sub.id;

            return (
              <div key={sub.id} className="group transition-all duration-200">
                <div
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 bg-white dark:bg-zinc-800",
                    isExpanded
                      ? "border-primary ring-1 ring-primary shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-sm",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {sub.nama}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isExpanded ? "secondary" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 text-xs font-medium",
                        isExpanded &&
                          "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                      onClick={() =>
                        setExpandedSubId(isExpanded ? null : sub.id)
                      }
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5 mr-1.5" /> Tutup
                        </>
                      ) : (
                        <>
                          <ListTree className="h-3.5 w-3.5 mr-1.5" /> Kelola
                          Opsi
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => {
                        if (
                          confirm(
                            "Yakin ingin menghapus pertanyaan ini beserta opsinya?",
                          )
                        ) {
                          deleteSub.mutate({ id: sub.id });
                        }
                      }}
                      disabled={deleteSub.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* --- PANEL EXPAND (MANAGE OPSI) --- */}
                {isExpanded && <ManageOpsiJawaban subKriteriaId={sub.id} />}
              </div>
            );
          })
        )}
      </div>

      {/* --- FORM TAMBAH SUB KRITERIA --- */}
      <div className="pt-5 border-t">
        <Label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
          Tambah Pertanyaan Baru
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Misal: Kualitas Kerapihan Packing"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="bg-white"
          />
          <Button
            onClick={handleAddSub}
            disabled={createSub.isPending}
            className="px-6 font-bold shadow-sm"
          >
            {createSub.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Tambah
          </Button>
        </div>
      </div>
    </div>
  );
};
