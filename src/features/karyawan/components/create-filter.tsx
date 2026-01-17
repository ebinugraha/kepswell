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
  // Create search using nuqs

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter dan tambah karyawan</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>
          <Button onClick={onClick}>Tambah karyawan</Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
