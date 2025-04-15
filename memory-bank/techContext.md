# Technical Context

## Technology Stack
- **Package Manager**: pnpm v10.8.1
- **Build Tool**: Turborepo
- **Core Language**: TypeScript 5.8.2
- **Node Version**: >=18
- **Frontend**: React
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth

## Development Setup
- Monorepo structure with apps/ and packages/ directories
- Turborepo for build orchestration and task running
- Prettier for code formatting
- TypeScript for type checking
- Supabase CLI for database management

## Technical Constraints
- Node.js version must be 18 or higher
- Must use pnpm for package management
- All code must pass TypeScript type checking
- Database policies must be defined in policies.sql
- UI components must follow established patterns

## Dependencies
### Core Build Tools
- turbo: ^2.5.0
- typescript: 5.8.2

### Frontend
- react: ^18
- next.js: ^14

### Database
- supabase-js: latest
- PostgreSQL: latest

### Development Tools
- prettier: ^3.5.3
- supabase CLI

## Build and Development Scripts
- `pnpm build`: Build all packages and applications
- `pnpm dev`: Start development servers
- `pnpm lint`: Run linting
- `pnpm format`: Format code with Prettier
- `pnpm check-types`: Run TypeScript type checking

## Project Structure
```
tanad/
├── apps/
│   └── admin-portal/    # Admin interface application
├── packages/           # Shared packages
├── src/
│   └── db/
│       ├── schema.ts   # Database schema
│       └── policies.sql # RLS policies
├── turbo.json         # Turborepo configuration
└── pnpm-workspace.yaml # Workspace configuration
```

Note: This document will be updated as new technologies and dependencies are added to the project. 