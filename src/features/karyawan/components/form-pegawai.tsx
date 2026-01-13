import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
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
import { useCreateKaryawan } from "../hooks/useKaryawan";
import { createKaryawanSchema } from "../schema";
import { toast } from "sonner";

interface FormPegawaiProps {
  onSuccess: () => void;
}

export type CreateKaryawanValues = z.infer<typeof createKaryawanSchema>;

export const FormPegawai = ({ onSuccess }: FormPegawaiProps) => {
  const createKaryawan = useCreateKaryawan();

  const form = useForm<CreateKaryawanValues>({
    defaultValues: {
      nip: "",
      divisi: "MARKETING",
      nama: "",
    },
    resolver: zodResolver(createKaryawanSchema),
  });

  const handleSubmit = async (data: CreateKaryawanValues) => {
    await createKaryawan.mutateAsync(
      {
        nip: data.nip,
        divisi: data.divisi,
        nama: data.nama,
      },
      {
        onSuccess: () => {
          toast.success("Karyawan berhasil ditambahkan");
          onSuccess();
        },
      }
    );
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
              <Label>Name</Label>
              <FormControl>
                <Input placeholder="Name" {...field} />
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
        <Button type="submit">Daftar</Button>
      </form>
    </Form>
  );
};
