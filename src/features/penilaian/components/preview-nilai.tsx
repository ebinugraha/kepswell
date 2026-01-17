"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileSearch } from "lucide-react";

interface PreviewNilaiProps {
  penilaianId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewNilai = ({
  penilaianId,
  isOpen,
  onClose,
}: PreviewNilaiProps) => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.penilaian.getById.queryOptions(
      { id: penilaianId as string },
      { enabled: !!penilaianId }
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Rincian Nilai: {data?.karyawan.nama}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 text-sm bg-muted/30 p-3 rounded-lg border">
              <div>
                <p className="text-muted-foreground">Divisi</p>
                <p className="font-semibold">{data?.karyawan.divisi}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Periode</p>
                <p className="font-semibold">Januari {data?.periodeTahun}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kriteria / Aspek</TableHead>
                  <TableHead className="text-center">Skor</TableHead>
                  <TableHead className="text-right">Atribut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.detailSkor.map((skor) => (
                  <TableRow key={skor.id}>
                    <TableCell>
                      <p className="font-medium">{skor.subKriteria.nama}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {skor.subKriteria.kriteria.nama}
                      </p>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">
                      {skor.nilai}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-[10px]">
                        {skor.subKriteria.kriteria.jenis}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-sm font-medium">
                Total Skor Akhir (SMART):
              </span>
              <span className="text-xl font-bold text-indigo-600">
                {data?.nilaiAkhir?.toFixed(2) ?? "Belum Dihitung"}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
