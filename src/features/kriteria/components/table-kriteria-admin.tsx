import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kriteria } from "../../../../prisma/generated/client";
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
import { Trash2Icon } from "lucide-react";
import { useDeleteKriteria } from "../hooks/use-kriteria";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export const TableKriteriaAdmin = ({
  kriteriaList,
}: {
  kriteriaList: Kriteria[];
}) => {
  const deleteMutation = useDeleteKriteria();

  const onClickDelete = (id: string) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Kriteria berhasil dihapus");
        },
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar Kriteria Admin</CardTitle>
        </div>

        {/* Dialog Tambah Kriteria */}
      </CardHeader>
      <CardContent>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Kriteria</TableHead>
              <TableHead>Bobot</TableHead>
              <TableHead>Atribut</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kriteriaList.length > 0 ? (
              kriteriaList.map((kriteria) => (
                <TableRow key={kriteria.id}>
                  <TableCell className="font-medium">{kriteria.nama}</TableCell>
                  <TableCell className="font-bold">{kriteria.bobot}</TableCell>
                  <TableCell className={"text-sm lowercase"}>
                    <Badge
                      variant={
                        kriteria.jenis === "BENEFIT" ? "emerald" : "destructive"
                      }
                    >
                      {kriteria.jenis}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => onClickDelete(kriteria.id)}
                    >
                      <Trash2Icon className="text-destructive size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Tidak ada kriteria untuk divisi admin
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
