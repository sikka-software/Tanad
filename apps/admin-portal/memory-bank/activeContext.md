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
- Store imports should match the file name exactly (e.g., `import useWarehousesStore from "@/stores/warehouses.store"`)
- Components should use the store's interface as defined in the store file

## Active Decisions
- Standardize on plural naming for collection stores to avoid confusion
- Maintain consistent import patterns across components
- Follow the Selection State Management pattern as defined in systemPatterns.md

## Next Steps
- Review other store implementations to ensure consistent naming
- Update any components that might be using incorrect store imports
- Document the store naming convention in the system patterns

## Known Issues
- ~~Infinite update loops in selection state~~ (Fixed with stable pattern)
- Need to verify all existing implementations use the correct pattern 