import { PenilaianForm } from "@/features/penilaian/components/penilaian-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ListPenilaian } from "../components/list-penilaian";

export function PenilaianView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Penilaian Karyawan</h1>
        <p className="text-muted-foreground text-sm">Metode Smart</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <PenilaianForm />
        {/* <ListPenilaian /> */}
      </div>
    </div>
  );
}
