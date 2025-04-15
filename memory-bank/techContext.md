# Technical Context

## Technology Stack
- **Package Manager**: pnpm v9.0.0
- **Build Tool**: Turborepo
- **Core Language**: TypeScript 5.8.2
- **Node Version**: >=18

## Development Setup
- Monorepo structure with apps/ and packages/ directories
- Turborepo for build orchestration and task running
- Prettier for code formatting
- TypeScript for type checking

## Technical Constraints
- Node.js version must be 18 or higher
- Must use pnpm for package management
- All code must pass TypeScript type checking

## Dependencies
### Core Build Tools
- turbo: ^2.5.0
- typescript: 5.8.2

### Development Tools
- prettier: ^3.5.3

## Build and Development Scripts
- `pnpm build`: Build all packages and applications
- `pnpm dev`: Start development servers
- `pnpm lint`: Run linting
- `pnpm format`: Format code with Prettier
- `pnpm check-types`: Run TypeScript type checking

## Project Structure
```
tanad/
├── apps/           # Application packages
├── packages/       # Shared packages
├── turbo.json     # Turborepo configuration
└── pnpm-workspace.yaml  # Workspace configuration
```

Note: This document will be updated as new technologies and dependencies are added to the project. 