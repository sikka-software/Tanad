"use client";

import { Plus, MoreVertical, Edit, Trash, Shield, Lock, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import { Role, Permission } from "@/types/rbac";

import { createClient } from "@/utils/supabase/component";

export default function RolesList({
  initialRoles,
  permissions,
}: {
  initialRoles: Role[];
  permissions: Permission[];
}) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
    isSystem: false,
  });

  const supabase = createClient();

  // Group permissions by category
  const permissionsByCategory = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle opening edit dialog
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  // Create new role
  const createNewRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const { data, error } = await supabase.from("roles").insert({
        name: newRole.name,
        description: newRole.description || "",
        permissions: newRole.permissions || [],
        isSystem: false,
      });

      if (error) throw error;

      // Update local state
      if (data) {
        setRoles([...roles, data as Role]);
      }

      toast.success("New role has been created successfully");

      // Reset form and close dialog
      setNewRole({
        name: "",
        description: "",
        permissions: [],
        isSystem: false,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    }
  };

  // Update role
  const updateRole = async () => {
    if (!selectedRole || !newRole.name) return;

    try {
      const { data, error } = await supabase
        .from("roles")
        .update({
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
        })
        .eq("id", selectedRole.id);

      if (error) throw error;

      // Update local state
      setRoles(
        roles.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: newRole.name || role.name,
                description: newRole.description || role.description,
                permissions: newRole.permissions || role.permissions,
              }
            : role,
        ),
      );

      toast.success("Role has been updated successfully");

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  // Delete role
  const deleteRole = async () => {
    if (!selectedRole) return;

    try {
      const { error } = await supabase.from("roles").delete().eq("id", selectedRole.id);

      if (error) throw error;

      // Update local state
      setRoles(roles.filter((role) => role.id !== selectedRole.id));

      toast.success("Role has been deleted successfully");

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error.message || "Failed to delete role");
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string, rolePermissions: string[]) => {
    if (rolePermissions.includes(permissionId)) {
      return rolePermissions.filter((id) => id !== permissionId);
    } else {
      return [...rolePermissions, permissionId];
    }
  };

  // Count permissions by category
  const countPermissionsByCategory = (rolePermissions: string[], category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.filter((p: Permission) => rolePermissions.includes(p.id)).length;
  };

  // Check if all permissions in a category are selected
  const areAllPermissionsSelected = (rolePermissions: string[], category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.every((p: Permission) => rolePermissions.includes(p.id));
  };

  // Toggle all permissions in a category
  const toggleCategoryPermissions = (category: string, rolePermissions: string[]) => {
    const categoryPermissions = permissionsByCategory[category] || [];

    if (areAllPermissionsSelected(rolePermissions, category)) {
      // Remove all permissions in this category
      return rolePermissions.filter(
        (id) => !categoryPermissions.some((p: Permission) => p.id === id),
      );
    } else {
      // Add all permissions in this category
      const permissionsToAdd = categoryPermissions
        .filter((p: Permission) => !rolePermissions.includes(p.id))
        .map((p: Permission) => p.id);
      return [...rolePermissions, ...permissionsToAdd];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="secondary" className="ml-2 px-1.5">
                        <Lock className="mr-1 h-3 w-3" />
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
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Role
                    </DropdownMenuItem>
                    {!role.isSystem && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteRole(role)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
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
                  <Shield className="text-muted-foreground mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">
                    {role.permissions.length} permissions
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(permissionsByCategory).map(
                    (category) =>
                      role.permissions.some(
                        (p) => permissions.find((perm) => perm.id === p)?.category === category,
                      ) && (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}: {countPermissionsByCategory(role.permissions, category)}/
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
              <Input
                id="name"
                placeholder="e.g., Content Manager"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this role is for..."
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>

            <div className="grid gap-3">
              <Label>Permissions</Label>
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[300px] pr-4">
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(permissionsByCategory).map(
                        ([category, categoryPermissions]) => (
                          <AccordionItem key={category} value={category}>
                            <AccordionTrigger className="py-2">
                              <div className="flex w-full items-center justify-between pr-4">
                                <span>{category}</span>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={areAllPermissionsSelected(
                                      newRole.permissions || [],
                                      category,
                                    )}
                                    onCheckedChange={() => {
                                      setNewRole({
                                        ...newRole,
                                        permissions: toggleCategoryPermissions(
                                          category,
                                          newRole.permissions || [],
                                        ),
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="text-muted-foreground text-xs">
                                    {countPermissionsByCategory(
                                      newRole.permissions || [],
                                      category,
                                    )}
                                    /{categoryPermissions.length}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2 pl-4">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`permission-${permission.id}`}
                                      checked={(newRole.permissions || []).includes(permission.id)}
                                      onCheckedChange={() => {
                                        setNewRole({
                                          ...newRole,
                                          permissions: togglePermission(
                                            permission.id,
                                            newRole.permissions || [],
                                          ),
                                        });
                                      }}
                                    />
                                    <div className="space-y-1">
                                      <Label
                                        htmlFor={`permission-${permission.id}`}
                                        className="font-medium"
                                      >
                                        {permission.name}
                                      </Label>
                                      <p className="text-muted-foreground text-sm">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ),
                      )}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewRole}>Create Role</Button>
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
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                disabled={selectedRole?.isSystem}
              />
              {selectedRole?.isSystem && (
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
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                disabled={selectedRole?.isSystem}
              />
            </div>

            <div className="grid gap-3">
              <Label>Permissions</Label>
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[300px] pr-4">
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(permissionsByCategory).map(
                        ([category, categoryPermissions]) => (
                          <AccordionItem key={category} value={category}>
                            <AccordionTrigger className="py-2">
                              <div className="flex w-full items-center justify-between pr-4">
                                <span>{category}</span>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={areAllPermissionsSelected(
                                      newRole.permissions || [],
                                      category,
                                    )}
                                    onCheckedChange={() => {
                                      setNewRole({
                                        ...newRole,
                                        permissions: toggleCategoryPermissions(
                                          category,
                                          newRole.permissions || [],
                                        ),
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="text-muted-foreground text-xs">
                                    {countPermissionsByCategory(
                                      newRole.permissions || [],
                                      category,
                                    )}
                                    /{categoryPermissions.length}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2 pl-4">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`edit-permission-${permission.id}`}
                                      checked={(newRole.permissions || []).includes(permission.id)}
                                      onCheckedChange={() => {
                                        setNewRole({
                                          ...newRole,
                                          permissions: togglePermission(
                                            permission.id,
                                            newRole.permissions || [],
                                          ),
                                        });
                                      }}
                                    />
                                    <div className="space-y-1">
                                      <Label
                                        htmlFor={`edit-permission-${permission.id}`}
                                        className="font-medium"
                                      >
                                        {permission.name}
                                      </Label>
                                      <p className="text-muted-foreground text-sm">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ),
                      )}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateRole}>Save Changes</Button>
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
            <AlertDialogAction onClick={deleteRole} className="bg-red-600 hover:bg-red-700">
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
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
