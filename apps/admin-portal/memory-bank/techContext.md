# Technical Context

## Data Management Implementation

### 1. Table Component Implementation

The table component (`employee.table.tsx`) uses:

- `@tanstack/react-table` for table functionality
- `zod` for validation
- Optimistic updates for better UX
- Local state for pending updates
- Global state for selection

Key implementation details:

```typescript
// State management
const [currentData, setCurrentData] = useState<Employee[]>(data);
const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Employee>>>({});

// Row selection
const handleRowSelectionChange = useCallback(
  (rows: Employee[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    setSelectedRows(newSelectedIds);
  },
  [setSelectedRows],
);

// Data editing
const handleEdit = useCallback(
  (rowId: string, columnId: string, value: unknown) => {
    // Track pending updates
    setPendingUpdates((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [columnId]: value },
    }));

    // Optimistic update
    setCurrentData((current) =>
      current.map((employee) =>
        employee.id === rowId ? { ...employee, [columnId]: value } : employee,
      ),
    );

    // API call
    updateEmployee({ id: rowId, updates: { [columnId]: value } });
  },
  [updateEmployee],
);
```

### 2. Page Implementation

The page component (`index.tsx`) uses:

- React Query for data fetching
- Zustand for state management
- Multiple view modes
- Search and filtering

Key implementation details:

```typescript
// Data fetching
const { data: employees, isLoading, error } = useEmployees();

// Search and filtering
const filteredEmployees = employees?.filter(
  (employee) =>
    employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()),
);

// Selection handling
const handleSelectedRowsChange = (rows: Employee[]) => {
  const newSelectedIds = rows.map((row) => row.id!);
  setSelectedRows(newSelectedIds);
};
```

### 3. Store Implementation

The store (`employees.store.ts`) uses:

- Zustand for state management
- Type-safe actions
- Selection state

Key implementation details:

```typescript
interface EmployeesState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  selectedRows: string[];
  fetchEmployees: () => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  setSelectedRows: (rows: string[]) => void;
  clearSelection: () => void;
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  // State
  employees: [],
  isLoading: false,
  error: null,
  selectedRows: [],

  // Actions
  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      set({ employees: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
```

### 4. Service Implementation

The service layer (`employeeService.ts`) uses:

- Supabase for database operations
- Type-safe API calls
- Data transformation

Key implementation details:

```typescript
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select(`
      *,
      department:departments (
        name
      )
    `);

  if (error) throw error;
  return data;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 5. Custom Hooks Implementation

The custom hooks (`useEmployees.ts`) use:

- React Query for data fetching and caching
- Optimistic updates
- Type-safe mutations

Key implementation details:

```typescript
export const useEmployees = () => {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: fetchEmployees,
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      updateEmployee(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: EMPLOYEES_QUERY_KEY });

      const previousEmployees = queryClient.getQueryData(EMPLOYEES_QUERY_KEY);

      queryClient.setQueryData(EMPLOYEES_QUERY_KEY, (old: Employee[] | undefined) => {
        if (!old) return old;
        return old.map((employee) => (employee.id === id ? { ...employee, ...updates } : employee));
      });

      return { previousEmployees };
    },
    onError: (_, __, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(EMPLOYEES_QUERY_KEY, context.previousEmployees);
      }
    },
  });
};
```

## Dependencies

- `@tanstack/react-table`: Table functionality
- `zod`: Validation
- `zustand`: State management
- `@tanstack/react-query`: Data fetching and caching
- `supabase`: Database operations
- `next-intl`: Internationalization
- `lucide-react`: Icons
