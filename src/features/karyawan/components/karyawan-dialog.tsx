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

interface KaryawanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KaryawanDialog({ open, onOpenChange }: KaryawanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FormPegawai onSuccess={() => onOpenChange(false)} />
        </DialogContent>
      </form>
    </Dialog>
  );
}
