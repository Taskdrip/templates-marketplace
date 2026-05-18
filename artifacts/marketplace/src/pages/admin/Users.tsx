import { useListAdminUsers, useUpdateAdminUser } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminUsersQueryKey } from "@workspace/api-client-react";

export default function AdminUsers() {
  const { data: users, isLoading } = useListAdminUsers();
  const updateUser = useUpdateAdminUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRoleChange = (id: number, role: string) => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "User updated", description: `User role changed to ${role}.` });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      }
    });
  };

  const handleStatusChange = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive } }, {
      onSuccess: () => {
        toast({ title: "User updated", description: `User status changed.` });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and permissions.</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
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
                  <TableCell><div className="h-8 bg-muted rounded-full w-8"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-32"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-24"></div></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-20 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {user.username.substring(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.totalPurchases || 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.isActive !== false ? "bg-emerald-500/20 text-emerald-500 border-none" : "bg-destructive/20 text-destructive border-none"}>
                      {user.isActive !== false ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`h-8 text-xs ${user.isActive !== false ? 'text-destructive hover:text-destructive' : 'text-emerald-500 hover:text-emerald-500'}`}
                      onClick={() => handleStatusChange(user.id, user.isActive === false ? true : false)}
                    >
                      {user.isActive !== false ? 'Suspend' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
