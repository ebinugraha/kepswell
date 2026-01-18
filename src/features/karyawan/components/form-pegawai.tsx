import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateKaryawan, useUpdateKaryawan } from "../hooks/useKaryawan";
import { createKaryawanSchema } from "../schema";
import { toast } from "sonner";
import { Karyawan } from "../../../../prisma/generated/client";
import { Switch } from "@/components/ui/switch";

interface FormPegawaiProps {
  onSuccess: () => void;
  karyawan: Karyawan | null;
}

export type CreateKaryawanValues = z.infer<typeof createKaryawanSchema>;

export const FormPegawai = ({ onSuccess, karyawan }: FormPegawaiProps) => {
  const createKaryawan = useCreateKaryawan();
  const updateKaryawan = useUpdateKaryawan();

  const form = useForm<CreateKaryawanValues>({
    defaultValues: {
      nip: karyawan?.nip || "",
      divisi: karyawan?.divisi || "MARKETING",
      nama: karyawan?.nama || "",
      status: karyawan?.status || true,
    },
    resolver: zodResolver(createKaryawanSchema),
  });

  const handleSubmit = async (data: CreateKaryawanValues) => {
    if (!karyawan) {
      await createKaryawan.mutateAsync(
        {
          nip: data.nip,
          divisi: data.divisi,
          nama: data.nama,
          status: data.status,
        },
        {
          onSuccess: () => {
            toast.success("Karyawan berhasil ditambahkan");
            onSuccess();
          },
        },
      );
    } else {
      await updateKaryawan.mutateAsync(
        {
          id: karyawan.id,
          nip: data.nip,
          divisi: data.divisi,
          nama: data.nama,
          status: data.status,
        },
        {
          onSuccess: () => {
            toast.success("Karyawan berhasil diupdate");
            onSuccess();
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="nip"
          render={({ field }) => (
            <FormItem>
              <Label>NIP</Label>
              <FormControl>
                <Input placeholder="NIP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <Label>Nama</Label>
              <FormControl>
                <Input placeholder="Nama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="divisi"
          render={({ field }) => (
            <FormItem>
              <Label>Divisi</Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a divisi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Divisi</SelectLabel>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="HOST_LIVE">Host Live</SelectItem>
                    <SelectItem value="PRODUKSI">Produksi</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Label>Status aktif</Label>
              <FormDescription>
                Apakah karyawan ini masih aktif bekerja?
              </FormDescription>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">
          {!!karyawan ? "Update Karyawan" : "Tambah Karyawan"}
        </Button>
      </form>
    </Form>
  );
};
