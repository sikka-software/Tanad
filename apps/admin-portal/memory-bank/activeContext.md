# Active Context

## Current Focus
Implementing bulk delete functionality across all data models (quotes, offices, departments, products).

## Recent Changes
- Fixed infinite update loop issue in selection state management
- Implemented stable selection pattern in Zustand stores
- Added documentation for selection state pattern

## Active Decisions
- Using state updater functions with comparison checks for all selection state
- Implementing consistent pattern across all data models
- Documenting patterns to prevent recurrence of issues

## Next Steps
- Apply stable selection pattern to remaining data models
- Verify no infinite loops in all implementations
- Test bulk delete functionality across all models

## Known Issues
- ~~Infinite update loops in selection state~~ (Fixed with stable pattern)
- Need to verify all existing implementations use the correct pattern 