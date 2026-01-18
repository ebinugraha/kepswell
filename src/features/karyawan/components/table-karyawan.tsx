"use client";

import { MoreHorizontal, Pencil, Trash2, User, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Karyawan } from "../../../../prisma/generated/client";

type TableKaryawanProps = {
  karyawan: Karyawan[];
  onClickEdit: (karyawan: Karyawan) => void;
};

// Helper warna untuk Divisi
const getBadgeVariant = (divisi: string) => {
  switch (divisi) {
    case "MARKETING":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200";
    case "HOST_LIVE":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200";
    case "PRODUKSI":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200";
    case "ADMIN":
      return "bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function TabelKaryawan({ karyawan, onClickEdit }: TableKaryawanProps) {
  const [filter, setFilter] = useState("");

  // Filter sederhana di client-side (bisa diganti server-side nanti)
  const filteredData = karyawan.filter(
    (item) =>
      item.nama.toLowerCase().includes(filter.toLowerCase()) ||
      item.nip.includes(filter),
  );

  return (
    <Card className="w-full border-0 shadow-none ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Daftar Karyawan</CardTitle>
          <CardDescription>
            Total {karyawan.length} karyawan aktif terdaftar.
          </CardDescription>
        </div>
        {/* Kolom Pencarian Cepat */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIP..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">No</TableHead>
                <TableHead className="">Karyawan</TableHead>
                <TableHead className="">Divisi</TableHead>
                <TableHead className="">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((list, index) => (
                  <TableRow key={list.id} className="hover:bg-muted/5">
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    {/* Kolom Nama + Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {list.nama.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {list.nama}
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {/* Bisa tambah jabatan/email jika ada */}
                            {list.status ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kolom Divisi (Badge) */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-normal ${getBadgeVariant(
                          list.divisi,
                        )}`}
                      >
                        {list.divisi.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    {/* Kolom Action */}
                    <TableCell className="">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onClickEdit(list)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* Empty State */
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {karyawan.length === 0
                      ? "Belum ada data karyawan."
                      : "Pencarian tidak ditemukan."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
