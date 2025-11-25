# Copilot Instructions for Recipe Search App

## Project Overview
This is a Next.js 16 (App Router) recipe discovery web app that integrates with the Spoonacular API. The app features recipe search with filters (cuisine, diet, intolerances) and displays results in a responsive grid. Data state is managed via React Context, and environment variables connect to Supabase and Spoonacular API.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase SDK, ESLint 9

## Architecture & Data Flow

### Core Components
- **`src/app/components/Hero.tsx`** (412 lines): Main search interface with multi-select filter dropdowns for cuisines, diets, and intolerances. Uses custom `useOutsideClose()` hook to manage dropdown state.
- **`src/app/components/SearchResult.tsx`**: Renders recipe grid (4 columns on desktop, responsive) reading from context state.
- **`src/app/context/RecepiesContext.tsx`**: Client-side context providing `recepies` state object + `setRecepies` setter. State shape includes `results` (RecipeResult[]), filters, pagination (offset/number).

### API Integration Pattern
1. **Frontend** (`src/app/lib/recipes.ts`): Wrapper functions `getRecepies(options)` and `getRecipeDetail(id)` that fetch from local `/api/recipes` routes
2. **API Routes** (`src/app/api/recipes/route.ts`, `[id]/route.ts`): Proxy requests to Spoonacular API, injecting `SPOONACULAR_API_KEY` server-side
3. **External API**: Spoonacular endpoint is `https://api.spoonacular.com/recipes/complexSearch` (list) and `/recipes/{id}/information` (detail)

### State Management Strategy
- Uses React Context (not Redux/Zustand) for simplicity
- State shape: `RecepiesState` includes both results AND filter params, enabling filter preservation across navigation
- Filters are stored as strings/arrays (e.g., `intolerances` is `string[]`)

### Supabase Configuration
- `src/app/lib/supabase.ts`: Initializes Supabase client with `persistSession: true` and `detectSessionInUrl: true`
- Requires env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Note:** Currently configured but not actively used in visible components—intended for future auth/user features

## Developer Workflows

### Build & Run
```bash
npm run dev          # Start dev server on http://localhost:3000 (auto hot-reload)
npm run build        # TypeScript + Next.js build (outputs .next/)
npm start            # Run production build
npm run lint         # ESLint check (includes next/core-web-vitals rules)
```

### Environment Setup
Create `.env.local` with:
```
SPOONACULAR_API_KEY=<your_api_key>
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
```

### Path Aliases
- `@/*` → `src/*` (configured in `tsconfig.json`, used throughout codebase as `@/app/...`)

## Key Patterns & Conventions

### Data Transformation
- **Utility functions** in `lib/recipes.ts`: `removeUndefinedValues()` strips null/empty values from payloads; `toCsv()` converts string arrays to comma-separated for API compatibility
- **Cache busting**: `sort: "random"` + `t: Date.now()` ensures fresh results per request (Spoonacular caches by query params)

### Filter Handling
- Intolerances can be passed as `string[]` or CSV string; `toCsv()` normalizes both
- Dropdowns store selections as strings; API payload generation handles conversion (see Hero.tsx line ~200+)
- Pagination via `number` (page size, default 20) and `offset` (skip count, default 0)

### Component Organization
- **Client components** use `"use client"` directive (Hero, SearchResult, context hooks)
- **Layouts** (`src/app/layout.tsx`): Wraps app with `RecepiesProvider`
- **Styling**: Tailwind utility classes; responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)

### Error Handling
- API routes return `{ error: "message" }` + HTTP status on failure
- Frontend fetch wrappers throw errors (client catches via try-catch during search)
- Missing env vars: Supabase logs console.warn; Spoonacular returns 500 error

## Important Notes

### Spelling Convention
- Project uses **"Recepies"** (misspelled) throughout codebase for state/context names (`RecepiesContext`, `useRecepies`, `RecepiesState`)—maintain consistency when adding code

### Spoonacular API Specifics
- **Query param names** are case-sensitive: `query`, `cuisine`, `diet`, `intolerances`, `number`, `offset`, `sort`
- Response shape: `{ results: [...], totalResults, number, offset }` (returned as-is by proxy routes)
- Base URL: `https://api.spoonacular.com` (hardcoded in `api/recipes/route.ts` and `[id]/route.ts`)

### Data Types
- Recipe IDs are **numbers** (from Spoonacular)
- Filter selections in UI are **strings** (display names like "Italian", "Vegan")
- `RecipeResult` minimal shape: `{ id: number, title: string, image: string }`

## Common Tasks

### Adding a New Filter
1. Add field to `CuisinesData`, `DietData`, or `IntolerancesData` in Hero.tsx
2. Update `RecepiesState` type in RecepiesContext.tsx if new category
3. Update payload construction in Hero's search handler + `getRecepies()` params

### Connecting Recipe Detail Page
- Route: `src/app/recipes/[id]/page.tsx` (not yet created)
- Use `getRecipeDetail(id)` from `lib/recipes.ts` (endpoint exists)
- API returns full recipe data (ingredients, instructions, etc.)

### Debugging API Requests
- Check browser DevTools → Network tab for `/api/recipes` requests
- Spoonacular errors: log `data` response (often contains `status: 401` for bad API key)
- Dev server logs show fetch errors in terminal
