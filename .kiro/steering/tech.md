# Technology Stack

## Core Technologies
- **React 19.1.0** - UI framework with latest features
- **TypeScript 5.8.3** - Type-safe JavaScript with strict configuration
- **Vite 7.0.4** - Build tool and dev server with SWC plugin for fast compilation

## Build System
- **Vite** with React SWC plugin for optimal performance
- **TypeScript** compilation with strict settings enabled
- **ESLint** for code quality with React-specific rules

## Development Dependencies
- `@vitejs/plugin-react-swc` - Fast React compilation
- `typescript-eslint` - TypeScript linting rules
- `eslint-plugin-react-hooks` - React Hooks linting
- `eslint-plugin-react-refresh` - React Fast Refresh support

## Common Commands
```bash
# Development server with hot reload
npm run dev

# Production build (TypeScript compilation + Vite build)
npm run build

# Code linting
npm run lint

# Preview production build
npm run preview
```

## TypeScript Configuration
- **Target**: ES2022 with DOM libraries
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx (React 17+ transform)
- **Strict mode**: Enabled with additional safety checks
- **No unused variables/parameters**: Enforced