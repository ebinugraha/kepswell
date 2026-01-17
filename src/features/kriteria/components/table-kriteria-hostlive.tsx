"use client";

import { useState } from "react";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useDeleteKriteria } from "../hooks/use-kriteria";
import { Kriteria } from "../../../../prisma/generated/client";

interface TableKriteriaProps {
  kriteriaList: Kriteria[];
  onClickKriteria: (kriteria: Kriteria) => void;
}

export const TableKriteriaHostLive = ({
  kriteriaList,
  onClickKriteria,
}: TableKriteriaProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteKriteria();

  // Helper untuk warna badge
  const getBadgeStyle = (jenis: string) => {
    return jenis === "BENEFIT"
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" // Hijau untuk Benefit
      : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200"; // Merah untuk Cost
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("Kriteria berhasil dihapus");
          setDeleteId(null);
        },
        onError: (err) => {
          toast.error("Gagal menghapus", {
            description: err.message,
          });
        },
      }
    );
  };

  return (
    <>
      <div className="rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead className="w-[40%]">Nama Kriteria</TableHead>
              <TableHead>Atribut</TableHead>
              <TableHead className="text-right">Bobot (%)</TableHead>
              <TableHead className="text-right w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kriteriaList.length > 0 ? (
              kriteriaList.map((kriteria, index) => (
                <TableRow key={kriteria.id} className="hover:bg-muted/5">
                  <TableCell className="text-muted-foreground text-xs">
                    {index + 1}
                  </TableCell>

                  <TableCell className="font-medium">{kriteria.nama}</TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-normal ${getBadgeStyle(kriteria.jenis)}`}
                    >
                      {kriteria.jenis}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium">
                    {kriteria.bobot}%
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onClickKriteria(kriteria)}
                        title="Edit Kriteria"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(kriteria.id)}
                        title="Hapus Kriteria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              /* Empty State */
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <AlertCircle className="h-8 w-8 opacity-20" />
                    <p>Belum ada kriteria untuk divisi Host Live.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Konfirmasi Delete */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus kriteria ini secara permanen.
              Perhitungan nilai lama mungkin akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Mencegah dialog tutup otomatis sebelum mutate selesai
                confirmDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
