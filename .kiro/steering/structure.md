# Project Structure

## Root Directory
```
├── src/                 # Source code
├── public/              # Static assets
├── .kiro/               # Kiro configuration and steering
├── .vscode/             # VS Code settings
├── .git/                # Git repository
├── node_modules/        # Dependencies (ignored)
└── dist/                # Build output (ignored)
```

## Source Directory (`src/`)
```
src/
├── main.tsx            # Application entry point
├── App.tsx             # Main App component
├── App.css             # App-specific styles
├── index.css           # Global styles
├── vite-env.d.ts       # Vite type definitions
└── assets/             # Static assets (images, icons, etc.)
```

## Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript project references
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node.js TypeScript config
- `eslint.config.js` - ESLint configuration

## File Naming Conventions
- **Components**: PascalCase (e.g., `App.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `apiHelpers.ts`, `formatUtils.ts`)
- **Styles**: Match component name (e.g., `App.css` for `App.tsx`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)

## Import Conventions
- Use `.tsx` extension for React components
- Use relative imports for local files
- Absolute imports from `node_modules`
- CSS imports should be co-located with components