import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateKriteria } from "../hooks/use-kriteria";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";

interface KriteriaDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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

export const KriteriaDialog = ({ isOpen, setIsOpen }: KriteriaDialogProps) => {
  const form = useForm<KriteriaFormData>({
    defaultValues: {
      bobot: 0,
      nama: "",
      jenis: "BENEFIT",
      divisi: "MARKETING",
    },
    resolver: zodResolver(kriteriaSchema),
  });

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
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kriteria Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-4">
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
              <FormField
                control={form.control}
                name="bobot"
                render={({ field }) => (
                  <FormItem>
                    <Label>Bobot (Angka)</Label>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Contoh: 10 atau 0.1"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BENEFIT">
                            Benefit (Makin besar makin bagus)
                          </SelectItem>
                          <SelectItem value="COST">
                            Cost (Makin kecil makin bagus)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="divisi"
                render={({ field }) => (
                  <FormItem>
                    <Label>Divisi</Label>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
