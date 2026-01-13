import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Karywan } from "../../../../prisma/generated/client";

type TableKaryawanProps = {
  karyawan: Karywan[];
};

export function TabelKaryawan({ karyawan }: TableKaryawanProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Karyawan</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">NIP</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Divisi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {karyawan.map((list) => (
              <TableRow key={list.id}>
                <TableCell className="font-medium">{list.nip}</TableCell>
                <TableCell>{list.nama}</TableCell>
                <TableCell>{list.divisi}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
