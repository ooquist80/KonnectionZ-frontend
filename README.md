# KonnectionZ Frontend

SPA frontend for the KonnectionZ word-connection game.

## Stack

- Vue 3 + TypeScript + Vite
- Vue Router
- Contract-first API integration against `http://localhost:8000/openapi.json`

## API endpoints used by MVP

- `POST /auth/token` (form-urlencoded) for login
- `GET /users/me` for profile/session restore
- `POST /play/` for daily puzzle game creation
- `GET /play/gamesets` for practice gameset selection
- `POST /play/{gameset_id}` for practice game creation
- `PUT /play/{game_id}` for turn submission

## Environment

Create `.env` (optional):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Run

```bash
npm install
npm run dev
```

## Validate

```bash
npm run build
```
