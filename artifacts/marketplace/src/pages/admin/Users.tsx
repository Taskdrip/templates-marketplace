import { useState } from "react";
import { useListAdminUsers, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { useUpdateAdminUser, useDeleteAdminUser } from "@/hooks/useMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserCog } from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean | null;
  createdAt: string;
  totalPurchases?: number;
  displayName?: string | null;
  phone?: string | null;
  telegramHandle?: string | null;
};

export default function AdminUsers() {
  const { data: users, isLoading } = useListAdminUsers();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", displayName: "", phone: "", telegramHandle: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });

  const handleRoleChange = (id: number, role: string) => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "Role updated", description: `User role changed to ${role}.` });
        invalidate();
      },
    });
  };

  const handleStatusChange = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: isActive ? "User activated." : "User suspended." });
        invalidate();
      },
    });
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      username: user.username ?? "",
      email: user.email ?? "",
      displayName: (user as any).displayName ?? "",
      phone: (user as any).phone ?? "",
      telegramHandle: (user as any).telegramHandle ?? "",
    });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    const data: Record<string, unknown> = {};
    if (editForm.username !== editUser.username) data.username = editForm.username;
    if (editForm.email !== editUser.email) data.email = editForm.email;
    if (editForm.displayName !== (editUser as any).displayName) data.displayName = editForm.displayName;
    if (editForm.phone !== (editUser as any).phone) data.phone = editForm.phone || null;
    if (editForm.telegramHandle !== (editUser as any).telegramHandle) data.telegramHandle = editForm.telegramHandle || null;

    if (Object.keys(data).length === 0) { setEditUser(null); return; }

    updateUser.mutate({ id: editUser.id, data }, {
      onSuccess: () => {
        toast({ title: "User updated", description: `Profile for ${editForm.username} saved.` });
        invalidate();
        setEditUser(null);
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleDelete = (user: User) => {
    deleteUser.mutate({ id: user.id }, {
      onSuccess: () => {
        toast({ title: "User deleted", description: `${user.username} has been removed.` });
        invalidate();
        setDeleteConfirm(null);
      },
      onError: (err: any) => {
        toast({ title: "Delete failed", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage user accounts, roles, and permissions.</p>
      </div>

      {/* Desktop table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-x-auto hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Purchases</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !users?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found.</TableCell>
              </TableRow>
            ) : (
              (users as User[]).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user.username}</p>
                        <p className="text-[11px] text-muted-foreground">#{user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.totalPurchases ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.isActive !== false ? "bg-emerald-500/20 text-emerald-500 border-none" : "bg-destructive/20 text-destructive border-none"}>
                      {user.isActive !== false ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Edit user" onClick={() => openEdit(user)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 text-xs ${user.isActive !== false ? "text-amber-500 hover:text-amber-400 border-amber-500/30" : "text-emerald-500 hover:text-emerald-400 border-emerald-500/30"}`}
                        onClick={() => handleStatusChange(user.id, user.isActive === false)}
                      >
                        {user.isActive !== false ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                        title="Delete user"
                        onClick={() => setDeleteConfirm(user)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-32 mb-2" />
              <div className="h-3 bg-muted rounded w-48" />
            </div>
          ))
        ) : !users?.length ? (
          <div className="text-center text-muted-foreground py-12 text-sm">No users found.</div>
        ) : (
          (users as User[]).map((user) => (
            <div key={user.id} className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className={user.isActive !== false ? "bg-emerald-500/20 text-emerald-500 border-none text-xs" : "bg-destructive/20 text-destructive border-none text-xs"}>
                  {user.isActive !== false ? "Active" : "Suspended"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openEdit(user)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs ${user.isActive !== false ? "text-amber-500 border-amber-500/30" : "text-emerald-500 border-emerald-500/30"}`}
                  onClick={() => handleStatusChange(user.id, user.isActive === false)}
                >
                  {user.isActive !== false ? "Suspend" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setDeleteConfirm(user)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => { if (!o) setEditUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-username" className="text-xs">Username</Label>
                <Input id="edit-username" value={editForm.username} onChange={(e) => setEditForm(f => ({ ...f, username: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-displayname" className="text-xs">Display Name</Label>
                <Input id="edit-displayname" value={editForm.displayName} onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs">Email</Label>
              <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs">Phone</Label>
                <Input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-sm" placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-telegram" className="text-xs">Telegram</Label>
                <Input id="edit-telegram" value={editForm.telegramHandle} onChange={(e) => setEditForm(f => ({ ...f, telegramHandle: e.target.value }))} className="h-9 text-sm" placeholder="@handle" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button size="sm" onClick={handleEditSave} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete User
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete <strong className="text-foreground">{deleteConfirm?.username}</strong>? This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
