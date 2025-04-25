import { Department, DepartmentCreateData } from "@/modules/department/department.type";

export async function fetchDepartmentsWithLocations(): Promise<Department[]> {
  try {
    const [departmentsRes, relRes] = await Promise.all([
      fetch("/api/resource/departments"),
      fetch("/api/resource/departmentLocations"), // or similar
    ]);

    if (!departmentsRes.ok || !relRes.ok) throw new Error("Failed to load data");

    const departments = await departmentsRes.json();
    const relations = await relRes.json(); // includes department_id, location_id, location_type

    // Optional: fetch all locations in one go and map by ID/type
    const allLocationIds = [...new Set(relations.map((r: any) => r.location_id))];
    const locationsRes = await fetch(
      "/api/resource/departmentLocations?ids=" + allLocationIds.join(","),
    );
    const locations = await locationsRes.json(); // Assume includes office/branch/warehouse in one response
    const locationMap = Object.fromEntries(locations.map((loc: any) => [loc.id, loc]));

    return departments.map((dept: any) => ({
      ...dept,
      locations: relations
        .filter((r: any) => r.department_id === dept.id)
        .map((r: any) => ({
          ...r,
          location: locationMap[r.location_id],
        })),
    }));
  } catch (error) {
    console.error("Error fetching departments with locations:", error);
    return [];
  }
}

export async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch("/api/resource/departments");
  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }
  return response.json();
}

export async function fetchDepartmentById(id: string): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}`);
  if (!response.ok) {
    throw new Error(`Department with id ${id} not found`);
  }
  return response.json();
}

export async function createDepartmentWithLocations(
  department: DepartmentCreateData,
): Promise<Department> {
  // Step 1: Create department
  const deptRes = await fetch("/api/resource/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: department.name,
      description: department.description,
      user_id: department.user_id,
      is_active: department.is_active,
    }),
  });

  if (!deptRes.ok) {
    throw new Error("Failed to create department");
  }

  const createdDept: Department = await deptRes.json();

  // Step 2: Create department-location relations
  const relationRes = await fetch("/api/resource/departmentLocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      department.locations.map((location) => ({
        department_id: createdDept.id,
        location_id: location.location_id,
        type: location.location_type,
        user_id: department.user_id,
      })),
    ),
  });

  if (!relationRes.ok) {
    throw new Error("Failed to create department-location relations");
  }

  // Step 3: Fetch the created department with its locations
  const deptWithLocations = await fetchDepartmentById(createdDept.id);
  return deptWithLocations;
}

export async function createDepartment(department: DepartmentCreateData): Promise<Department> {
  const response = await fetch("/api/resource/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(department),
  });
  if (!response.ok) {
    throw new Error("Failed to create department");
  }
  return response.json();
}

export async function updateDepartment(
  id: string,
  updates: Partial<Department>,
): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update department with id ${id}`);
  }
  return response.json();
}

export async function duplicateDepartment(id: string): Promise<Department> {
  const response = await fetch(`/api/resource/departments/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate department with id ${id}`);
  }
  return response.json();
}

export async function deleteDepartment(id: string): Promise<void> {
  const response = await fetch(`/api/resource/departments/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete department with id ${id}`);
  }
}

export async function bulkDeleteDepartments(ids: string[]): Promise<void> {
  const response = await fetch("/api/resource/departments", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete departments");
  }
}
