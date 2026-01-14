// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { useTRPC } from "@/trpc/client";
// import { useQuery } from "@tanstack/react-query";
// import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
// import { usePenilaianStore } from "../hooks/use-penilaian-store";
// import { PenilaianInput } from "../schema";

// const BULAN = [
//   "Januari",
//   "Februari",
//   "Maret",
//   "April",
//   "Mei",
//   "Juni",
//   "Juli",
//   "Agustus",
//   "September",
//   "Oktober",
//   "November",
//   "Desember",
// ];
// const TAHUN = ["2024", "2025", "2026"];

// export const ListPenilaian = () => {
//   const { setSelectedData } = usePenilaianStore();
//   const trpc = useTRPC();

//   // State Filter Periode (Default ke bulan/tahun sekarang)
//   const [filterBulan, setFilterBulan] = useState(
//     new Date().toLocaleString("id-ID", { month: "long" })
//   );
//   const [filterTahun, setFilterTahun] = useState(
//     new Date().getFullYear().toString()
//   );

//   // Ambil data berdasarkan filter
//   const { data: statusKaryawan, isLoading } = useQuery(
//     trpc.penilaian.getStatusKaryawan.queryOptions({
//       bulan: filterBulan,
//       tahun: filterTahun,
//     })
//   );

//   return (
//     <Card className="shadow-md h-full">
//       <CardHeader className="flex flex-col space-y-4 bg-slate-50/50">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-xl">Monitoring Status</CardTitle>
//           {isLoading && (
//             <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
//           )}
//         </div>

//         {/* Kontrol Filter Periode */}
//         <div className="flex gap-2">
//           <Select value={filterBulan} onValueChange={setFilterBulan}>
//             <SelectTrigger className="w-[140px] bg-white">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {BULAN.map((b) => (
//                 <SelectItem key={b} value={b}>
//                   {b}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={filterTahun} onValueChange={setFilterTahun}>
//             <SelectTrigger className="w-[100px] bg-white">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {TAHUN.map((t) => (
//                 <SelectItem key={t} value={t}>
//                   {t}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>

//       <CardContent className="p-1">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Nama Karyawan</TableHead>
//               <TableHead className="text-center">Status</TableHead>
//               <TableHead className="text-center">Detail Nilai (%)</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {statusKaryawan?.map((k) => (
//               <TableRow
//                 key={k.id}
//                 onClick={() => {
//                   if (k.status && k.nilai) {
//                     // Jika sudah ada data, kirim data penilaiannya
//                     setSelectedData({
//                       karyawanId: k.id,
//                       bulan: filterBulan,
//                       tahun: filterTahun,
//                       kualitas: k.nilai.c1,
//                       kuantitas: k.nilai.c2,
//                       kedisiplinan: k.nilai.c3,
//                       sikap: k.nilai.c4,
//                     });
//                   } else {
//                     // Jika belum ada, hanya isi karyawan dan periodenya saja
//                     setSelectedData({
//                       karyawanId: k.id,
//                       bulan: filterBulan,
//                       tahun: filterTahun,
//                       kualitas: 75, // default
//                       kuantitas: 75,
//                       kedisiplinan: 75,
//                       sikap: 75,
//                     });
//                   }
//                 }}
//                 className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
//               >
//                 <TableCell>
//                   <div className="flex flex-col">
//                     <span className="font-medium text-sm">{k.nama}</span>
//                     <span className="text-[10px] text-muted-foreground uppercase">
//                       {k.divisi}
//                     </span>
//                   </div>
//                 </TableCell>
//                 <TableCell className="text-center">
//                   {k.status ? (
//                     <Badge variant={"default"}>
//                       <CheckCircle2 className="w-3 h-3 mr-1" /> Ternilai
//                     </Badge>
//                   ) : (
//                     <Badge variant="destructive">
//                       <XCircle className="w-3 h-3 mr-1" /> Belum
//                     </Badge>
//                   )}
//                 </TableCell>
//                 <TableCell className="text-center">
//                   {k.status ? (
//                     <div className="flex justify-center gap-1 text-[10px] font-mono">
//                       <span title="Kualitas">{k.nilai?.c1}</span>|
//                       <span title="Kuantitas">{k.nilai?.c2}</span>|
//                       <span title="Kedisiplinan">{k.nilai?.c3}</span>|
//                       <span title="Sikap">{k.nilai?.c4}</span>
//                     </div>
//                   ) : (
//                     <span className="text-muted-foreground text-xs italic">
//                       N/A
//                     </span>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// };
