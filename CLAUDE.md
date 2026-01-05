# Vellum

A stateless, client-side visualizer that renders CloudFormation (CFN) templates into interactive infrastructure diagrams. No backend, no data persistence—all parsing and rendering happen in browser memory.

## Quick Start

```bash
npm install
npm run dev          # Start development server
npm run storybook    # Component development
npm run test         # Run tests
npm run lint         # Lint and format
```

## Git Workflow

**All development must happen on feature branches. Direct pushes to `main` are forbidden.**

```bash
# Start new work
git checkout -b feature/my-feature

# When ready, push and create PR
git push -u origin feature/my-feature
```

### Branch Naming

- `feature/` — New features (e.g., `feature/graph-layout`)
- `fix/` — Bug fixes (e.g., `fix/yaml-parsing-error`)
- `chore/` — Maintenance tasks (e.g., `chore/update-deps`)
- `docs/` — Documentation only (e.g., `docs/api-reference`)

### Merge Strategy

All changes reach `main` through pull requests. Netlify creates deploy previews for each PR.

## Tech Stack

| Category | Technology |
|----------|------------|
| Build | Vite |
| Language | TypeScript (strict mode) |
| Framework | React |
| UI System | @cloudscape-design/components |
| Graph Engine | @xyflow/react |
| Layout Engine | elkjs |
| CFN Parsing | Native JSON (no external parser needed) |
| Testing | Vitest + React Testing Library |
| Documentation | Storybook |
| Linting | ESLint + Prettier |

## Architecture

### Atomic Design Structure

```
src/
├── components/
│   ├── atoms/           # Base UI wrappers (IconWrapper, ResourceLabel, StatusBadge)
│   ├── molecules/       # Functional units (NodeCard, EditorToolbar)
│   ├── organisms/       # Complex sections (GraphCanvas, InputPanel, PropertiesPanel)
│   └── templates/       # Page layouts (SplitViewLayout)
├── hooks/               # Custom React hooks
├── lib/                 # Core logic (parsing, graph transformation)
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

### Component Guidelines

- **Atoms**: Thin wrappers around Cloudscape components, single responsibility
- **Molecules**: Combine 2-3 atoms into reusable functional units
- **Organisms**: Self-contained features with their own state management
- **Templates**: Layout composition only, no business logic

## Core Features

### 1. Input Engine (`src/lib/parser.ts`)

Parses CloudFormation JSON templates with full type safety.

```typescript
import { parseTemplate } from '@/lib/parser';

const result = parseTemplate(jsonString);
if (result.success) {
  console.log(result.template.Resources);
} else {
  console.error(result.error);
}
```

**Features:**
- Discriminated union return type (`ParseResult`)
- Validates template structure (Resources required, logical ID format, etc.)
- Preserves intrinsic functions (`Ref`, `Fn::GetAtt`, `Fn::Sub`, etc.)
- Utility functions: `getResourceIds()`, `getResourcesByType()`, `getResourceDependencies()`

Display parse errors via Cloudscape Alert component in InputPanel.

### 2. Graph Transformation (`src/lib/graph-transformer.ts`)

Converts parsed CFN to React Flow nodes/edges:

1. **Nodes**: Each `Resources[LogicalId]` becomes a node. `Type` determines icon, `LogicalId` is the label.
2. **Edges**: Recursively scan properties for `Ref` and `Fn::GetAtt`. Edge direction: Consumer → Dependency.
3. **Layout**: Pass nodes/edges to elkjs with layered downward strategy.

### 3. Visualization (`src/components/organisms/GraphCanvas.tsx`)

- Custom React Flow nodes using `NodeCard` molecule
- Edge style: SmoothStep or Bezier
- Auto fit-to-view on render
- Supports Cloudscape dark/light theme

## Code Style

### TypeScript

- Strict mode enabled, no `any` types
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for variant types
- Export types from dedicated `types/` directory

### React

- Functional components only
- Custom hooks for reusable logic
- Props interfaces named `{ComponentName}Props`
- Memoize expensive computations with `useMemo`/`useCallback`

### File Naming

- Components: `PascalCase.tsx` (e.g., `NodeCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useGraphLayout.ts`)
- Utils/lib: `kebab-case.ts` (e.g., `graph-transformer.ts`)
- Tests: `{filename}.test.ts(x)` colocated with source
- Stories: `{ComponentName}.stories.tsx` colocated with component

### Imports

Order imports as:
1. React/external libraries
2. Internal absolute imports (`@/`)
3. Relative imports
4. Type imports (separate with blank line)

## Testing Strategy

- **Unit tests**: Parser logic, graph transformation functions
- **Component tests**: React Testing Library for user interactions
- **Visual tests**: Storybook for component variations

Focus test coverage on:
- CFN parsing edge cases (intrinsic functions, nested refs)
- Graph edge detection accuracy
- Node/edge rendering correctness

## AWS Resource Icons

Map CFN resource types to AWS Architecture Icons. Common mappings:

| CFN Type | Icon Category |
|----------|---------------|
| `AWS::Lambda::Function` | Compute/Lambda |
| `AWS::S3::Bucket` | Storage/S3 |
| `AWS::DynamoDB::Table` | Database/DynamoDB |
| `AWS::EC2::Instance` | Compute/EC2 |
| `AWS::IAM::Role` | Security/IAM |
| `AWS::SNS::Topic` | App Integration/SNS |
| `AWS::SQS::Queue` | App Integration/SQS |
| `AWS::ApiGateway::RestApi` | App Integration/API Gateway |

## Deployment

Deployed via **Netlify** with automatic builds from the `main` branch.

### Configuration

See `netlify.toml` for build settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 20 |

### SPA Routing

All routes redirect to `index.html` for client-side routing (status 200).

### Security Headers

- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — Restricts resource loading

### Caching

Static assets in `/assets/*` are cached with `max-age=31536000, immutable` (1 year).

### Deploy Previews

Netlify automatically creates preview deployments for pull requests.

## Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] `npm run storybook` shows NodeCard molecule
- [ ] Unit tests pass for CFN parsing (`!Ref` → valid JSON)
- [ ] Pasting valid CFN template renders graph
- [ ] UI matches Cloudscape visual identity (dark/light mode support)
