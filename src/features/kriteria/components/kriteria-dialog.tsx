import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react"; // 1. Jangan lupa import useEffect
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateKriteria } from "../hooks/use-kriteria";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import { Kriteria } from "../../../../prisma/generated/client";
import { ManageSubKriteria } from "./manage-sub-kriteria";

interface KriteriaDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  kriteria: Kriteria | null;
}

export type KriteriaFormData = z.infer<typeof kriteriaSchema>;

export const kriteriaSchema = z.object({
  nama: z.string().min(1, "Nama kriteria wajib diisi"),
  bobot: z.coerce
    .number<number>()
    .min(0.01, "Bobot minimal 0.01")
    .max(100, "Bobot maksimal 100"),
  jenis: z.enum(["BENEFIT", "COST"]),
  divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
});

export const KriteriaDialog = ({
  isOpen,
  setIsOpen,
  kriteria,
}: KriteriaDialogProps) => {
  const form = useForm<KriteriaFormData>({
    defaultValues: {
      bobot: 0,
      nama: "",
      jenis: "BENEFIT",
      divisi: "MARKETING",
    },
    resolver: zodResolver(kriteriaSchema),
  });

  useEffect(() => {
    if (kriteria) {
      // Jika mode EDIT (ada data kriteria), isi form dengan data tersebut
      form.reset({
        nama: kriteria.nama,
        bobot: kriteria.bobot,
        jenis: kriteria.jenis as "BENEFIT" | "COST", // Casting jika perlu
        divisi: kriteria.divisi as
          | "MARKETING"
          | "HOST_LIVE"
          | "PRODUKSI"
          | "ADMIN",
      });
    } else {
      // Jika mode CREATE (kriteria null), kosongkan form ke default
      form.reset({
        nama: "",
        bobot: 0,
        jenis: "BENEFIT",
        divisi: "MARKETING",
      });
    }
  }, [kriteria, isOpen, form]);

  // 2. Mutation Tambah
  const createMutation = useCreateKriteria();

  const handleSubmit = (data: KriteriaFormData) => {
    createMutation.mutate(
      {
        nama: data.nama,
        bobot: data.bobot, // Pastikan input bobot desimal (misal 0.2) atau persen sesuai kesepakatan
        jenis: data.jenis,
        divisi: data.divisi,
      },
      {
        onSuccess: () => {
          toast.success("Kriteria berhasil ditambahkan");
          setIsOpen(false);
          form.reset();
        },
      },
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* PERBAIKAN TAMPILAN:
        1. sm:max-w-[600px] -> Membuat modal agak lebih lebar agar tabel subkriteria muat.
        2. max-h-[90vh] -> Membatasi tinggi modal maksimal 90% dari tinggi layar.
        3. flex flex-col -> Agar header tetap di atas dan body mengisi sisa ruang.
      */}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* HEADER: Tetap di atas (Fixed) */}
        <DialogHeader className="p-6 pb-2 border-b bg-white dark:bg-zinc-950 z-10">
          <DialogTitle>
            {kriteria ? "Edit Kriteria & Sub-Kriteria" : "Tambah Kriteria Baru"}
          </DialogTitle>
        </DialogHeader>

        {/* BODY: Area Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 py-2">
                {/* Nama Kriteria */}
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Nama Kriteria</Label>
                      <FormControl>
                        <Input placeholder="Contoh: Kedisiplinan" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Bobot */}
                  <FormField
                    control={form.control}
                    name="bobot"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Bobot (%)</Label>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Contoh: 20"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Jenis Atribut */}
                  <FormField
                    control={form.control}
                    name="jenis"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Jenis Atribut</Label>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BENEFIT">
                                Benefit (Positif)
                              </SelectItem>
                              <SelectItem value="COST">
                                Cost (Negatif)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Divisi */}
                <FormField
                  control={form.control}
                  name="divisi"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Divisi</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        // Disable divisi jika edit agar konsisten (opsional, sesuaikan kebutuhan)
                        disabled={!!kriteria}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Divisi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="HOST_LIVE">Host Live</SelectItem>
                          <SelectItem value="PRODUKSI">Produksi</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Tombol Simpan (Hanya muncul jika belum ada ID/Create Mode) */}
              {!kriteria?.id && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Kriteria
                </Button>
              )}
            </form>
          </Form>

          {/* Manage Sub Kriteria: Muncul di bawah form jika Edit Mode */}
          {kriteria?.id && (
            <div className="mt-6 pt-6 border-t">
              <ManageSubKriteria kriteriaId={kriteria.id} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
