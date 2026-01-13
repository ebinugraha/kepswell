import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateFilterCardProps {
  onClick: () => void;
}

export const CreateFilterCard = ({ onClick }: CreateFilterCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter dan tambah karyawan</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>
          <Button onClick={onClick}>Tambah karyawan</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-2">
          <div className="relative">
            <SearchIcon className="absolute size-4 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Cari nama atau NIP" />
          </div>
          <Select>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Filter divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Divisi</SelectLabel>
                <SelectItem value="apple">Marketing</SelectItem>
                <SelectItem value="banana">Host Live</SelectItem>
                <SelectItem value="blueberry">Produksi</SelectItem>
                <SelectItem value="grapes">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
