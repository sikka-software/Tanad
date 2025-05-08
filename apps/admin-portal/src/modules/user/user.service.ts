import { UserType, UserCreateData, UserUpdateData } from "./user.type";

export async function fetchUsers(): Promise<UserType[]> {
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

export async function fetchUserById(id: string): Promise<UserType> {
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

export async function createUser(user: UserCreateData): Promise<UserType> {
  try {
    // Cast user to any to access the 'role' name field added by the form
    const userDataWithRoleName = user as any;

    // Extract only the fields the API expects
    const apiPayload = {
      email: userDataWithRoleName.email,
      password: userDataWithRoleName.password, // Assume password is required
      role: userDataWithRoleName.role, // Role name (present at runtime)
      full_name: userDataWithRoleName.full_name,
    };

    const response = await fetch("/api/resource/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      let errorDetails = "Failed to create user";
      try {
        const errorData = await response.json();
        errorDetails = errorData.details || errorData.error || errorDetails;
      } catch (parseError) {
        console.error("Failed to parse error response from API");
      }
      console.error("Create User API Error Response:", response.status, errorDetails);
      throw new Error(errorDetails);
    }

    return response.json();
  } catch (error) {
    console.error("Error creating user (service level):", error);
    throw error;
  }
}

export async function updateUser(id: string, updates: UserUpdateData): Promise<UserType> {
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

export async function duplicateUser(id: string): Promise<UserType> {
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
