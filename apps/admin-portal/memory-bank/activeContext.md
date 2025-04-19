# Active Context

## Current Focus

Implementing bulk delete functionality across all data models (quotes, offices, departments, products).

## Recent Changes

### Warehouse Store Resolution

- Identified and resolved confusion between `warehouse.store.ts` and `warehouses.store.ts`
- Confirmed that `warehouses.store.ts` (plural) is the correct implementation
- Deleted redundant `warehouse.store.ts` (singular)
- Updated component imports to use the correct store

### Current Implementation Standards

- Store naming convention: Use plural form for collection stores (e.g., `warehouses.store.ts`, not `warehouse.store.ts`)
- Store imports should match the file name exactly (e.g., `import useWarehouseStore from "@/stores/warehouses.store"`)
- Components should use the store's interface as defined in the store file

### Data Mutation Implementation

- Implemented proper React Query mutation pattern for salary bulk deletions
- Created new `/api/salaries/bulk-delete` endpoint
- Added `useBulkDeleteSalaries` mutation hook
- Fixed UI refresh issues by properly invalidating queries

### Form Component Standardization

- Standardized form component structure across the project
- Moved from component-level to page-level API integration
- Implemented consistent prop interfaces
- Added development tools support

### Current Patterns

1. Form Components

   - Validation at component level
   - UI rendering and state management
   - Window object exposure for development
   - Consistent prop interface

2. Page Components

   - API integration
   - Cache management
   - Navigation handling
   - Error management

3. Development Tools
   - Dummy data generation
   - Form testing utilities
   - Development-only features

## Active Decisions

- Standardize on plural naming for collection stores to avoid confusion
- Maintain consistent import patterns across components
- Follow the Selection State Management pattern as defined in systemPatterns.md
- Use React Query for all data mutations
- Implement bulk operations for multi-item actions
- Return 204 for successful deletions
- Handle loading states with `isPending`
- Show toast notifications for operation feedback

### Form Management

- Using Zod for schema validation
- Separating API calls from form components
- Implementing consistent error handling
- Supporting development tools

### Component Structure

- Feature-based organization
- Clear separation of concerns
- Consistent file naming
- Reusable patterns

### Data Flow

- Page-level API integration
- React Query for cache management
- Toast notifications for user feedback
- Type-safe data handling

## Next Steps

### Immediate Tasks

1. Apply standardized form pattern to remaining forms
2. Implement consistent error handling across all forms
3. Add development tools support to all form components
4. Update documentation for new patterns

### Future Considerations

1. Enhanced type safety
2. Improved error handling
3. Extended development tools
4. Performance optimizations

## Known Issues

- ~~Infinite update loops in selection state~~ (Fixed with stable pattern)
- Need to verify all existing implementations use the correct pattern
- None currently, but monitoring for any mutation-related bugs

### Form Components

- Need to standardize remaining form components
- Implement consistent error handling
- Add development tools support

### Development Tools

- Extend dummy data generation
- Improve form testing utilities
- Add more development features

## Recent Fixes

- Fixed salary deletion requiring page refresh
- Implemented proper bulk delete functionality
- Added loading states during deletion

## Recent Implementation: CRUD Module Pattern for Companies

### Key Components and Their Interactions

1. **Store Pattern (`companies.store.ts`)**

   ```typescript
   interface CompaniesState {
     companies: Company[];
     selectedRows: string[];
     isLoading: boolean;
     error: string | null;
     fetchCompanies: (userId) => Promise<void>;
     updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
     setSelectedRows: (ids: string[]) => void;
     clearSelection: () => void;
   }
   ```

   - Centralized state management
   - Selection state handling with optimizations
   - Basic CRUD operations
   - Error and loading states

2. **Table Component Pattern (`company.table.tsx`)**

   ```typescript
   interface CompaniesTableProps {
     data: Company[];
     isLoading?: boolean;
     error?: Error | null;
     onSelectedRowsChange?: (rows: Company[]) => void;
   }
   ```

   - Validation schemas for each field
   - Selection handling with checkboxes
   - Inline editing support
   - Loading and error states

3. **Page Pattern (`companies/index.tsx`)**

   ```typescript
   const [searchQuery, setSearchQuery] = useState("");
   const [viewMode, setViewMode] = useState<"table" | "cards">("table");
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   ```

   - Search functionality
   - View mode switching (table/cards)
   - Selection mode UI
   - Bulk actions handling

4. **Service Layer Pattern (`companyService.ts`)**

   ```typescript
   export async function bulkDeleteCompanies(ids: string[]): Promise<void> {
     const response = await fetch("/api/companies", {
       method: "DELETE",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ ids }),
     });
     if (!response.ok) throw new Error("Failed to delete companies");
   }
   ```

   - API abstraction
   - Error handling
   - Type safety
   - Consistent response handling

5. **API Routes Pattern**

   ```typescript
   if (req.method === "DELETE") {
     try {
       const result = await db.delete(companies)
         .where(eq(companies.id, id))
         .returning();

       if (!result.length) {
         return res.status(404).json({ message: "Company not found" });
       }
       return res.status(200).json({ message: "Company deleted successfully" });
     } catch (error) {
       return res.status(500).json({ message: "Error deleting company" });
     }
   }
   ```

   - RESTful endpoints
   - Proper error handling
   - Input validation
   - Status code consistency

### Key Learnings

1. **State Management**

   - Always implement selection state with optimizations
   - Use state updater functions to prevent infinite loops
   - Handle loading and error states consistently

2. **Component Structure**

   - Table components should handle their own validation
   - Form components should be reusable between create/edit
   - Card components for alternative view modes

3. **API Design**

   - Implement both single and bulk operations
   - Consistent error handling across all endpoints
   - Proper status codes and response formats
   - Input validation at API level

4. **Type Safety**

   - Define clear interfaces for all components
   - Use TypeScript generics for reusable components
   - Validate data at multiple levels (client/server)

5. **Performance Considerations**
   - Optimize selection state updates
   - Use proper caching strategies
   - Implement optimistic updates

### Implementation Checklist

1. **Setup Phase**

   - [ ] Define database schema
   - [ ] Create TypeScript interfaces
   - [ ] Setup validation schemas

2. **Component Creation**

   - [ ] Create table component with selection
   - [ ] Create form component
   - [ ] Create card component
   - [ ] Implement validation

3. **State Management**

   - [ ] Setup store with selection state
   - [ ] Implement CRUD operations
   - [ ] Add error handling
   - [ ] Add loading states

4. **API Layer**

   - [ ] Create service functions
   - [ ] Implement API routes
   - [ ] Add bulk operations
   - [ ] Setup error handling

5. **Pages**
   - [ ] Create list page with search/filter
   - [ ] Create add/edit pages
   - [ ] Implement bulk actions
   - [ ] Add loading states

### Common Pitfalls to Avoid

1. **Selection State**

   - Don't update state without checking for changes
   - Don't forget to clear selection after actions
   - Don't mix controlled/uncontrolled selection

2. **API Handling**

   - Don't forget to handle all error cases
   - Don't mix null/undefined in optional fields
   - Don't forget to validate input data

3. **Type Safety**

   - Don't use any types
   - Don't ignore TypeScript errors
   - Don't mix interfaces inconsistently

4. **Performance**
   - Don't update state unnecessarily
   - Don't fetch data multiple times
   - Don't forget to implement proper caching

### Next Steps

1. Enhance error handling with more specific messages
2. Add sorting functionality to tables
3. Implement more advanced filtering options
4. Add batch update operations
5. Improve loading state UIs

### Primary Goals

1. Standardize all form components
2. Implement consistent patterns
3. Improve developer experience
4. Maintain code quality

### Secondary Goals

1. Enhance type safety
2. Optimize performance
3. Improve error handling
4. Update documentation
