import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormPegawai } from "./form-pegawai";
import { Karyawan } from "../../../../prisma/generated/client";

interface KaryawanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  karyawan: Karyawan | null;
}

export function KaryawanDialog({
  open,
  onOpenChange,
  karyawan,
}: KaryawanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Tambah karyawan</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambahkan karyawan baru.
            </DialogDescription>
          </DialogHeader>
          <FormPegawai
            onSuccess={() => onOpenChange(false)}
            karyawan={karyawan}
          />
        </DialogContent>
      </form>
    </Dialog>
  );
}
