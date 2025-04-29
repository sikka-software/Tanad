import { User, UserCreateData, UserUpdateData } from "./user.type";

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch("/api/resource/users");
    if (!response.ok) {
      console.error("Failed to fetch users:", response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function fetchUserById(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/resource/users/${id}`);
    if (!response.ok) {
      throw new Error(`User with id ${id} not found`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
}

export async function createUser(user: UserCreateData): Promise<User> {
  try {
    const response = await fetch("/api/resource/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(id: string, updates: UserUpdateData): Promise<User> {
  const response = await fetch(`/api/resource/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update user with id ${id}`);
  }
  return response.json();
}

export async function duplicateUser(id: string): Promise<User> {
  const response = await fetch(`/api/resource/users/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate user with id ${id}`);
  }
  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/resource/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete user with id ${id}`);
  }
}

export async function bulkDeleteUsers(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/users", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete users");
  }
}

export async function getUserPermissions(role: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/resource/users/permissions/${role}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch permissions for role ${role}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  }
}
