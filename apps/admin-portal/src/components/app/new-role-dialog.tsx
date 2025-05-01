"use client";

import { Plus, MoreVertical, Edit, Trash, Shield, Lock, Search } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import React from "react";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { ScrollArea } from "@/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

import { Permission } from "@/types/rbac";

import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/role/role.hooks";
import { RoleWithPermissions, RoleUpdateData } from "@/role/role.type";

import { app_permission } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const ACTION_DISPLAY_NAMES: Record<string, string> = {
  create: "Create",
  read: "View",
  update: "Edit",
  delete: "Delete",
  export: "Export",
  duplicate: "Duplicate",
  invite: "Invite",
  assign: "Assign",
};

// Helper function to generate permissions list (moved from old usePermissions hook)
const generatePermissionsList = (): Permission[] => {
  const permissions = app_permission.enumValues.map((permission: string) => {
    const [category, action] = permission.split(".");
    const displayName = ACTION_DISPLAY_NAMES[action] || action;
    const formattedCategory = category
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      id: permission,
      name: `${displayName} ${formattedCategory}`,
      description: `Permission to ${action} ${formattedCategory.toLowerCase()}`,
      category: formattedCategory,
    };
  });

  const groupedPermissions = permissions.reduce(
    (acc: Record<string, Permission[]>, permission: Permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {},
  );

  const sortedPermissions = Object.values(groupedPermissions)
    .flat()
    .sort((a: Permission, b: Permission) => {
      const categoryCompare = a.category.localeCompare(b.category);
      if (categoryCompare !== 0) return categoryCompare;
      const actionOrder = [
        "create",
        "read",
        "update",
        "delete",
        "export",
        "duplicate",
        "invite",
        "assign",
      ];
      const aAction = a.id.split(".")[1];
      const bAction = b.id.split(".")[1];
      return actionOrder.indexOf(aAction) - actionOrder.indexOf(bAction);
    });

  return sortedPermissions;
};

// Add this new component before the main RolesList component
const PermissionsSection = React.memo(function PermissionsSection({
  permissionsByCategory,
  selectedPermissions,
  onPermissionChange,
  onCategoryToggle,
  isDisabled = false,
}: {
  permissionsByCategory: Record<string, Permission[]>;
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string) => void;
  onCategoryToggle: (category: string) => void;
  isDisabled?: boolean;
}) {
  const areAllPermissionsSelected = useCallback(
    (category: string) => {
      const categoryPermissions = permissionsByCategory[category] || [];
      return categoryPermissions.every((p: Permission) => selectedPermissions.includes(p.id));
    },
    [permissionsByCategory, selectedPermissions],
  );

  const countPermissionsByCategory = useCallback(
    (category: string) => {
      const categoryPermissions = permissionsByCategory[category] || [];
      return categoryPermissions.filter((p: Permission) => selectedPermissions.includes(p.id))
        .length;
    },
    [permissionsByCategory, selectedPermissions],
  );

  return (
    <Card>
      <CardContent className="p-4">
        <ScrollArea className="h-[300px] pe-4">
          <Accordion type="multiple" className="w-full">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="py-2">
                  <div className="flex w-full items-center justify-between pe-4">
                    <span>{category}</span>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={areAllPermissionsSelected(category)}
                        onCheckedChange={() => onCategoryToggle(category)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isDisabled}
                      />
                      <span className="text-muted-foreground text-xs">
                        {countPermissionsByCategory(category)}/{categoryPermissions.length}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 ps-4 pt-2">
                    {categoryPermissions.map((permission: Permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => onPermissionChange(permission.id)}
                          disabled={isDisabled}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                            {permission.name}
                          </Label>
                          <p className="text-muted-foreground text-sm">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default function RolesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [newRole, setNewRole] = useState<Partial<RoleWithPermissions>>({
    name: "",
    description: "",
    permissions: [],
    is_system: false,
  });

  const { enterprise } = useUserStore(); // Get enterprise from store

  // Generate permissions list
  const permissions = useMemo(() => generatePermissionsList(), []);
  const isLoadingPermissions = false; // Placeholder, as it's now synchronous

  // Fetch data using hooks
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    return permissions.reduce(
      (acc: Record<string, Permission[]>, permission: Permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }, [permissions]);

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role: RoleWithPermissions) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Handle opening edit dialog
  const handleEditRole = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error("Role name cannot be empty.");
      return;
    }
    if (!enterprise?.id) {
      toast.error("Cannot create role: No enterprise selected.");
      return;
    }

    // Validate role name format (lowercase, numbers, underscores)
    if (!/^[a-z0-9_]+$/.test(newRole.name)) {
      toast.error("Role name must contain only lowercase letters, numbers, and underscores.");
      return;
    }

    try {
      await createRole.mutateAsync({
        name: newRole.name,
        description: newRole.description || "",
        permissions: newRole.permissions || [],
        enterprise_id: enterprise.id,
      });

      // Reset form and close dialog
      setNewRole({
        name: "",
        description: "",
        permissions: [],
        is_system: false,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!selectedRole || !newRole.name) return;

    // Prepare update data according to RoleUpdateData structure
    const updateData: RoleUpdateData = {
      name: newRole.name,
      description: newRole.description || undefined,
      permissions: newRole.permissions || [],
    };

    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        data: updateData,
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole.mutateAsync(selectedRole.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string, currentPermissions: string[]) => {
    // Ensure currentPermissions is an array
    const permissionsArray = Array.isArray(currentPermissions) ? currentPermissions : [];
    if (permissionsArray.includes(permissionId)) {
      return permissionsArray.filter((id) => id !== permissionId);
    } else {
      return [...permissionsArray, permissionId];
    }
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (category: string, currentPermissions: string[]) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const categoryPermissionIds = categoryPermissions.map((p: Permission) => p.id);
    const permissionsArray = Array.isArray(currentPermissions) ? currentPermissions : [];

    // Check if *all* permissions in this category are currently selected
    const allSelected = categoryPermissionIds.every((id) => permissionsArray.includes(id));

    if (allSelected) {
      // Remove all permissions in this category
      return permissionsArray.filter((id) => !categoryPermissionIds.includes(id));
    } else {
      // Add all permissions in this category (only those not already present)
      const permissionsToAdd = categoryPermissionIds.filter((id) => !permissionsArray.includes(id));
      return [...permissionsArray, ...permissionsToAdd];
    }
  };

  // Helper function to count permissions in a category
  const countPermissionsInCategory = (rolePermissions: string[], category: string) => {
    const permissionsArray = Array.isArray(rolePermissions) ? rolePermissions : [];
    const categoryPermissionIds = (permissionsByCategory[category] || []).map(
      (p: Permission) => p.id,
    );
    return permissionsArray.filter((id) => categoryPermissionIds.includes(id)).length;
  };

  // Add this constant at the top of the component
  const AVAILABLE_ROLES = [
    { value: "admin", label: "Admin" },
    { value: "accounting", label: "Accounting" },
    { value: "hr", label: "HR" },
  ];

  return (
    <div className="space-y-6">
      Permissions length: {permissions.length}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="ps-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="me-2 h-4 w-4" /> Add Role
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role: RoleWithPermissions) => (
          <Card key={role.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {role.name}
                    {role.is_system && (
                      <Badge variant="secondary" className="ms-2 px-1.5">
                        <Lock className="me-1 h-3 w-3" />
                        System
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{role.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditRole(role)}>
                      <Edit className="me-2 h-4 w-4" />
                      Edit Role
                    </DropdownMenuItem>
                    {!role.is_system && (
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(role)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="me-2 h-4 w-4" />
                        Delete Role
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Shield className="text-muted-foreground me-2 h-4 w-4" />
                  <span className="text-muted-foreground">
                    {role.permissions?.length} permissions
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(permissionsByCategory).map(
                    (category) =>
                      role.permissions?.some(
                        (p_id: string) =>
                          permissions.find((perm: Permission) => perm.id === p_id)?.category ===
                          category,
                      ) && (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}: {countPermissionsInCategory(role.permissions, category)}/
                          {permissionsByCategory[category].length}
                        </Badge>
                      ),
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleEditRole(role)}
              >
                View Permissions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role and assign permissions to control what users with this role can do.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Role Name</Label>
              <div className="flex gap-2">
                <Select
                  value={newRole.name}
                  onValueChange={(value) => setNewRole({ ...newRole, name: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select predefined role" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    id="name"
                    placeholder="Or enter custom role name (lowercase, numbers, underscores only)"
                    value={newRole.name || ""}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="ps-2"
                  />
                  {newRole.name && !/^[a-z0-9_]+$/.test(newRole.name) && (
                    <p className="mt-1 text-xs text-red-500">
                      Role name must contain only lowercase letters, numbers, and underscores
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this role is for..."
                value={newRole.description || ""}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>

            <div className="grid gap-3">
              <Label>Permissions</Label>
              <PermissionsSection
                permissionsByCategory={permissionsByCategory}
                selectedPermissions={newRole.permissions || []}
                onPermissionChange={(permissionId) => {
                  setNewRole({
                    ...newRole,
                    permissions: togglePermission(permissionId, newRole.permissions || []),
                  });
                }}
                onCategoryToggle={(category) => {
                  setNewRole({
                    ...newRole,
                    permissions: toggleCategoryPermissions(category, newRole.permissions || []),
                  });
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>Modify role details and permissions.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Content Manager"
                value={newRole.name || ""}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                disabled={selectedRole?.is_system}
              />
              {selectedRole?.is_system && (
                <p className="text-muted-foreground text-xs">
                  System role names cannot be changed.
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what this role is for..."
                value={newRole.description || ""}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                disabled={selectedRole?.is_system}
              />
            </div>

            <div className="grid gap-3">
              <Label>Permissions</Label>
              <PermissionsSection
                permissionsByCategory={permissionsByCategory}
                selectedPermissions={newRole.permissions || []}
                onPermissionChange={(permissionId) => {
                  setNewRole((prev) => ({
                    ...prev,
                    permissions: togglePermission(permissionId, prev.permissions || []),
                  }));
                }}
                onCategoryToggle={(category) => {
                  setNewRole((prev) => ({
                    ...prev,
                    permissions: toggleCategoryPermissions(category, prev.permissions || []),
                  }));
                }}
                isDisabled={selectedRole?.is_system}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &quot;{selectedRole?.name}&quot;. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Empty state */}
      {filteredRoles.length === 0 && (
        <div className="py-10 text-center">
          <div className="bg-muted mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Shield className="text-muted-foreground h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No roles found</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchQuery ? "Try a different search term." : "Get started by creating a new role."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="me-2 h-4 w-4" /> Add Role
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
