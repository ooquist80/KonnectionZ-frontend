# KonnectionZ Frontend – Copilot Instructions

SPA frontend for the KonnectionZ word-connection game. Vue 3 + TypeScript + Vite, no UI framework, no state-management library.

## Commands

```bash
npm run dev        # start dev server (http://localhost:5173)
npm run build      # type-check with vue-tsc, then vite build
npm run preview    # preview the production build
```

There is no test runner or linter configured.

## Architecture

Feature-based directory layout under `src/`:

```
src/
  auth/       views + store (login, register, profile)
  game/       views + components + store (daily game, practice)
  admin/      views + components (user/gameset/wordset management)
  home/       home view
  shared/
    api/      http.ts, authApi.ts, playApi.ts, adminApi.ts
    auth/     tokenStorage.ts (localStorage wrapper)
    types/    api.ts (all shared API types)
    ui/       reusable components (e.g. ApiErrorBanner)
  router/     index.ts (route definitions + auth guards)
```

## Key Conventions

### State management – composable singleton stores
There is no Pinia or Vuex. Stores are plain TypeScript modules that declare `ref`s at module level (shared across all callers) and export a composable function:

```ts
// module-level refs → singleton state
const token = ref<string | null>(null)

export function useAuthStore() {
  // computed + methods that close over the refs
  return { token, ... }
}
```

### API layer
All HTTP calls go through `shared/api/http.ts → requestJson<T>()`. The JWT bearer token is passed **explicitly as a parameter** — it is never injected globally.

- `POST /auth/token` uses `application/x-www-form-urlencoded` (not JSON).
- HTTP errors throw `ApiError` (extends `Error`) with `.status` and `.payload`.
- Base URL is `import.meta.env.VITE_API_BASE_URL`, defaulting to `http://localhost:8000`.
- API types live exclusively in `shared/types/api.ts`.

OpenAPI spec is at `http://localhost:8000/openapi.json` when the backend is running.

### Auth / routing
- JWT stored in `localStorage` under key `konnectionz.accessToken` via `shared/auth/tokenStorage.ts`.
- Route guard in `router/index.ts` checks `getStoredToken()` for routes with `meta: { requiresAuth: true }`.
- Session is restored in `App.vue`'s `onMounted` by calling `auth.restoreSession()`.

### Environment
Create `.env` at the repo root to override the API URL:
```
VITE_API_BASE_URL=http://localhost:8000
```
