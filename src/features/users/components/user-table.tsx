"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteUser,
  useSuspenseUsers,
  useUpdateUserRole,
} from "../hooks/use-user";
import { Role } from "../../../../prisma/generated/enums";

export function UserTable() {
  const { data: users, isLoading } = useSuspenseUsers();

  const updateUser = useUpdateUserRole();

  const deleteUser = useDeleteUser();

  if (isLoading) return <div>Memuat data...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Terdaftar</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(val) =>
                    updateUser.mutate(
                      { id: user.id, role: val as Role },
                      {
                        onSuccess: () => {
                          toast.success(
                            `${user.name} Role user diperbarui menjadi ${val}`,
                          );
                        },
                      },
                    )
                  }
                  disabled={updateUser.isPending}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (
                      confirm("Apakah Anda yakin ingin menghapus user ini?")
                    ) {
                      deleteUser.mutate({ id: user.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {users?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                Tidak ada pengguna.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
