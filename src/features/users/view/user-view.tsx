import { UserDialog } from "../components/user-dialog";
import { UserTable } from "../components/user-table";

export function UserView() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Daftar pengguna dan manajemen hak akses (Role).
          </p>
        </div>
        <UserDialog />
      </div>
      <UserTable />
    </div>
  );
}
