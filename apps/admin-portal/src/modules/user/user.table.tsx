"use client";

import {
  MoreHorizontal,
  Search,
  UserCog,
  Shield,
  User,
  UserX,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserForm } from "./user.form";
import { useDeleteUser, useUpdateUser, useUsers } from "./user.hooks";

// Define user types
export type UserType = {
  id: string;
  email: string;
  role: "superadmin" | "accounting" | "hr";
  enterprise_id: string;
  created_at: string;
};

interface UsersTableProps {
  currentUser: UserType;
  users: UserType[];
  userPermissions: Record<string, string[]>;
  onUpdateUser?: (user_id: string, role: string, enterprise_id: string) => Promise<void>;
  loading: boolean;
}

export default function UsersTable({
  currentUser,
  users,
  userPermissions,
  onUpdateUser,
  loading,
}: UsersTableProps) {
  const t = useTranslations();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle opening edit dialog
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Save user changes
  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: {
          role: selectedUser.role,
          enterprise_id: selectedUser.enterprise_id,
        },
      });

      toast.success(t("Users.toast.success.updated"), {
        description: t("Users.toast.success.updated_description"),
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(t("Users.toast.error.update_failed"), {
        description: t("Users.toast.error.update_failed_description"),
      });
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);

      toast.success(t("Users.toast.success.deleted"), {
        description: t("Users.toast.success.deleted_description"),
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(t("Users.toast.error.delete_failed"), {
        description: t("Users.toast.error.delete_failed_description"),
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("Users.table.created_at_never");
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Shield className="me-1 h-4 w-4" />;
      case "admin":
        return <UserCog className="me-1 h-4 w-4" />;
      default:
        return <User className="me-1 h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder={t("Users.search_placeholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("Users.add_dialog.title")}</DialogTitle>
              <DialogDescription>{t("Users.add_dialog.description")}</DialogDescription>
            </DialogHeader>
            <UserForm currentUser={currentUser} onSuccess={() => setIsAddUserDialogOpen(false)} />
          </DialogContent>
        </Dialog> */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Users.form.email.label")}</TableHead>
              <TableHead>{t("Users.form.role.label")}</TableHead>
              <TableHead>{t("Users.form.permissions.label")}</TableHead>
              <TableHead>{t("Forms.created_at.label")}</TableHead>
              <TableHead className="text-right">{t("General.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  {t("General.loading")}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  {t("Users.table.no_users")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center py-1">
                      {getRoleIcon(user.role)}
                      {t(`Roles.roles.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger>
                        <div className="flex flex-row gap-2">
                          {userPermissions[user.id]?.length}
                          <span className="text-muted-foreground">
                            {t("Users.form.permissions.label")}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="max-h-[300px] overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {userPermissions[user.id]?.map((permission) => (
                            <Badge key={permission} variant="secondary">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {currentUser.id !== user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("Users.actions.open_menu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("Users.table.head.actions")}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            {t("General.edit")}
                          </DropdownMenuItem>
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                            >
                              {t("General.delete")}
                            </DropdownMenuItem>
                          </>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Users.edit_dialog.title")}</DialogTitle>
            <DialogDescription>{t("Users.edit_dialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("Users.edit_dialog.email_label")}
              </Label>
              <Input id="email" value={selectedUser?.email} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                {t("Users.edit_dialog.role_label")}
              </Label>
              <Select
                value={selectedUser?.role}
                onValueChange={(value) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, role: value as UserType["role"] } : null,
                  )
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Users.edit_dialog.select_role_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">{t("Roles.roles.superadmin")}</SelectItem>
                  <SelectItem value="accounting">{t("Roles.roles.accounting")}</SelectItem>
                  <SelectItem value="hr">{t("Roles.roles.hr")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("General.cancel")}
            </Button>
            <Button onClick={saveUserChanges}>{t("Users.edit_dialog.save_button")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Users.delete_dialog.title")}</DialogTitle>
            <DialogDescription>{t("Users.delete_dialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t("Users.delete_dialog.user_prefix")}{" "}
              <span className="text-foreground font-medium">
                {selectedUser?.email || t("Users.delete_dialog.no_email")}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("General.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("Users.delete_dialog.delete_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
