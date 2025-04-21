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

import { createClient } from "@/utils/supabase/component";

// Define user types
type AuthUser = {
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export type UserType = {
  id: string;
  email: string;
  role: "superadmin" | "accounting" | "hr";
  enterprise_id: string;
  created_at: string;
};

interface UsersTableProps {
  initialUsers: UserType[];
  enterprises: Array<{ id: string; name: string }>;
  currentUser: UserType;
  onCreateUser: (email: string, password: string, role: string, enterpriseId: string) => Promise<void>;
  onUpdateUser: (userId: string, role: string, enterpriseId: string) => Promise<void>;
}

type NewUserType = {
  email: string;
  password: string;
  role: "accounting" | "hr";
  enterpriseId: string;
};

export default function UsersTable({
  initialUsers,
  enterprises,
  currentUser,
  onCreateUser,
  onUpdateUser,
}: UsersTableProps) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "",
    is_active: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState<NewUserType>({
    email: "",
    password: "",
    role: "accounting",
    enterpriseId: "",
  });

  const supabase = createClient();
  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle opening edit dialog
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.email,
      role: user.role,
      is_active: true,
    });
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
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          role: editForm.role,
          is_active: editForm.is_active,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                email: editForm.full_name,
                role: editForm.role,
                is_active: editForm.is_active,
              }
            : user,
        ),
      );

      toast.success("User updated", {
        description: "User information has been updated successfully.",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user information.", {
        description: "Failed to update user information.",
      });
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id));

      toast.success("User deleted", {
        description: "User has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.", {
        description: "Failed to delete user.",
      });
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user: UserType) => {
    try {
      const newStatus = !user.is_active;

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)));

      toast.success(newStatus ? "User activated" : "User deactivated", {
        description: `User has been ${newStatus ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status.", {
        description: "Failed to update user status.",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
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
        return <Shield className="mr-1 h-4 w-4" />;
      case "admin":
        return <UserCog className="mr-1 h-4 w-4" />;
      default:
        return <User className="mr-1 h-4 w-4" />;
    }
  };

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.enterpriseId) return;
    
    await onCreateUser(
      newUser.email,
      newUser.password,
      newUser.role,
      newUser.enterpriseId
    );
    
    setIsCreating(false);
    setNewUser({
      email: "",
      password: "",
      role: "accounting",
      enterpriseId: "",
    });
  };

  const handleUpdate = async (userId: string, role: string, enterpriseId: string) => {
    await onUpdateUser(userId, role, enterpriseId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={() => setIsCreating(true)}>Add User</Button>
      </div>

      {isCreating && (
        <div className="mb-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create New User</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "accounting" | "hr" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accounting">Accounting</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="enterprise">Enterprise</Label>
              <Select
                value={newUser.enterpriseId}
                onValueChange={(value) => setNewUser({ ...newUser, enterpriseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enterprise" />
                </SelectTrigger>
                <SelectContent>
                  {enterprises.map((enterprise) => (
                    <SelectItem key={enterprise.id} value={enterprise.id}>
                      {enterprise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Enterprise</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {enterprises.find((e) => e.id === user.enterprise_id)?.name}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const newRole = user.role === "accounting" ? "hr" : "accounting";
                            handleUpdate(user.id, newRole, user.enterprise_id);
                          }}
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newEnterpriseId = prompt("Enter new enterprise ID");
                            if (newEnterpriseId) {
                              handleUpdate(user.id, user.role, newEnterpriseId);
                            }
                          }}
                        >
                          Change Enterprise
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user&apos;s profile here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, is_active: value === "active" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              User:{" "}
              <span className="text-foreground font-medium">
                {selectedUser?.email || "No email"}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
