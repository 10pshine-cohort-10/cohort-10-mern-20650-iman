# Notes App (MERN with TypeScript: MongoDB + Express + React + Node) — Project Plan

> Status: **all questions answered.** Decisions are locked in Section 2 (updated to TypeScript for CodeRabbit compliance).
> Next step: open `TASKS.md` and say **"go"** to start T0.

---

## 1. What we are building

A full-stack Notes app with **TypeScript**. Each user signs up, logs in, and manages **only their own** notes
(create / read / update / delete) with a **rich text editor**.

Mandatory cross-cutting requirements (built early, they touch every task):

| Requirement | Where it lives |
|---|---|
| TypeScript (strict types, interfaces, 0 CodeRabbit HIGH flags) | Backend & Frontend |
| Pino logging (events, errors, HTTP req/res, user activity) | Backend |
| Global exception handling middleware (with try/catch safety) | Backend |
| Mocha + Chai unit tests | Backend |
| Jest unit tests | Frontend |
| SonarQube analysis | Whole repo |
| Git branching + merging + PRs | Whole repo |
| MongoDB (Mongoose) data model | Backend |

---

## 2. FINAL DECISIONS (from your answers)

| # | Topic | Decision |
|---|---|---|
| Q1 | Database | **MongoDB** (assignment intro allows "SQL database or MongoDB") |
| Q2 | Language | **TypeScript** (Strict mode; satisfies CodeRabbit `Flag missing TypeScript types as HIGH`) |
| Q3 | DB access | **Mongoose** (with typed schemas and documents) |
| Q4 | Token storage | **JWT in httpOnly cookie** |
| Q5 | Where MongoDB runs | **Docker container** (docker-compose) |
| Q6 | Rich text editor | **TipTap** (modern, headless, good for CV) |
| Q7 | Styling | **Tailwind CSS** |
| Q8 | Note editor | **Separate page** `/notes/:id` (built as a reusable component so a modal is an easy change later) |
| Q9 | Optional features | **Profile page, Search & filter** |
| Q9b | Standout features | **Pin + tags + colors, Autosave + dark mode, Public share link**; **AI summary = stretch task** if you finish early |
| Q10 | SonarQube | **Docker** |
| Q11 | OS | **Windows** (PowerShell commands, Docker Desktop with WSL2) |
| Q12 | Deadline | **No fixed deadline** — required features first, extras after |
| Q13 | Git remote | **GitHub repo already created** (forked to `Iman-Vision`), PR will target upstream |
| Q14 | Delete behavior | **Soft delete, auto hard-delete after 30 days** |

Heads-up: one bullet in the assignment text says "MySQL or PostgreSQL Database", while the
intro says "SQL database or MongoDB" and the stack mentions MySQL. MongoDB is explicitly allowed in
the intro, but it is worth a one-line confirmation with your instructor/mentor.

---

## 3. High-level architecture

```
React (Vite + Tailwind) ──HTTP/JSON (cookie)──▶ Express API ──▶ Service ──▶ Repository ──▶ Mongoose ──▶ MongoDB (Docker)
                                                     │
                                                     ├── pino-http (request/response logs)
                                                     ├── auth middleware (JWT from httpOnly cookie)
                                                     └── global error middleware (logs with Pino)
```

Layers (this makes "test controllers, services, and data access layers" easy):

- **Routes** map URL to controller
- **Controllers** read req, call service, send res (no business logic)
- **Services** business rules (ownership checks, share tokens, trash rules)
- **Repositories** the only place that calls Mongoose models
- **Middleware** auth, validation, error handler, not-found, request logger

---

## 4. Folder structure

```
cohort-10-mern-20650-iman/
├── README.md
├── docker-compose.yml            (mongo + sonarqube)
├── sonar-project.properties
├── .gitignore
├── .coderabbit.yaml
├── package.json                  (root scripts: lint, test, docker)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.ts                (express app, no listen)
│   │   ├── server.ts             (connect DB, listen, graceful shutdown)
│   │   ├── config/               (env, db connection)
│   │   ├── logger/               (pino instance)
│   │   ├── types/                (user, note, express request augmentations)
│   │   ├── models/               (User, Note)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/           (auth, validate, errorHandler, notFound)
│   │   └── utils/                (AppError, asyncHandler, token helpers)
│   └── test/                     (mocha + ts-node: controllers, services, repositories, middleware)
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── jest.config.ts
    └── src/
        ├── api/                  (axios instance + typed calls)
        ├── types/                (Note, User, API responses)
        ├── context/              (AuthContext, ThemeContext)
        ├── components/           (NoteCard, NoteEditor, TagInput, ColorPicker ...)
        ├── pages/                (Login, Signup, Dashboard, NoteEditorPage, Trash, Profile, SharedNote)
        ├── routes/               (ProtectedRoute)
        ├── hooks/                (useDebounce, useAutosave)
        └── __tests__/
```

---

## 5. Database design (MongoDB + Mongoose)

### users collection

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | bcrypt, `select: false` |
| `createdAt` / `updatedAt` | Date | Mongoose `timestamps: true` |

### notes collection

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `user` | ObjectId (ref User) | required, **indexed** |
| `title` | String | required |
| `content` | String | rich text as HTML |
| `plainText` | String | text version of content, used for search |
| `pinned` | Boolean | default false |
| `color` | String | one of a fixed palette, default `"default"` |
| `tags` | [String] | lowercase, trimmed, max ~10 per note |
| `shareToken` | String | optional, unique token string when shared (field omitted when unshared to prevent null collisions) |
| `isShared` | Boolean | default false |
| `deletedAt` | Date | `null` = active, date = in trash |
| `createdAt` / `updatedAt` | Date | timestamps |

### Indexes

- `{ user: 1, deletedAt: 1, pinned: -1, updatedAt: -1 }` — dashboard listing
- `{ user: 1, tags: 1 }` — tag filter
- text index on `title` + `plainText` — search
- `{ shareToken: 1 }` unique with partial filter expression `{ shareToken: { $type: "string" } }` (or omitted when unshared) — public link lookup
- **TTL index** on `deletedAt` with `expireAfterSeconds: 2592000` (30 days) — MongoDB itself permanently deletes trashed notes after a month. Documents where `deletedAt` is `null` are never expired.

### Soft delete rules (Q14)

1. `DELETE /notes/:id` sets `deletedAt = now` (note goes to Trash).
2. Trash page lists them; user can **restore** (set `deletedAt = null`) or **delete permanently**.
3. After 30 days the TTL index removes them automatically.
4. Trashed notes are excluded from the dashboard, search, and public share links.

Note: the TTL monitor in MongoDB runs about once a minute, so removal is not to-the-second, which is fine here.

---

## 6. Backend approach

### 6.1 Authentication (httpOnly cookie)

- Passwords hashed with **bcrypt**.
- On login/signup the server sets a JWT in an **httpOnly** cookie (`SameSite=Lax`, `Secure` in production). JavaScript in the browser cannot read it, which blocks token theft via XSS.
- Needs: `cookie-parser`, CORS with `credentials: true` and an explicit origin, and axios with `withCredentials: true`.
- Logout clears the cookie server-side.
- `SameSite=Lax` plus JSON-only requests gives reasonable CSRF protection for this project.

### 6.2 API design

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register, set cookie |
| POST | `/api/auth/login` | No | Login, set cookie |
| POST | `/api/auth/logout` | Yes | Clear cookie |
| GET | `/api/users/me` | Yes | Profile |
| GET | `/api/notes` | Yes | List my active notes. Query: `search`, `tag`, `color`, `pinned`, `sort` |
| GET | `/api/notes/:id` | Yes | One note |
| POST | `/api/notes` | Yes | Create |
| PUT | `/api/notes/:id` | Yes | Update (also used by autosave) |
| DELETE | `/api/notes/:id` | Yes | **Soft delete** (to Trash) |
| GET | `/api/notes/trash` | Yes | List trashed notes |
| POST | `/api/notes/:id/restore` | Yes | Restore from Trash |
| DELETE | `/api/notes/:id/permanent` | Yes | Hard delete now |
| PATCH | `/api/notes/:id/pin` | Yes | Toggle pin |
| POST | `/api/notes/:id/share` | Yes | Create/enable share link |
| DELETE | `/api/notes/:id/share` | Yes | Revoke share link |
| GET | `/api/public/notes/:token` | **No** | Read-only view of a shared note |
| GET | `/api/tags` | Yes | My distinct tags (for filter dropdown) |

Every notes query filters by `user = req.user.id`, so users can never touch other users' notes.

### 6.3 Public share link

- `crypto.randomBytes(24).toString("hex")` as the token (unguessable).
- Public endpoint returns only `title`, `content` (sanitized), `updatedAt`, author name. Never email or ids.
- Revoking sets `isShared=false` and clears the token; the old link instantly returns 404.
- Rate limit the public endpoint.

### 6.4 Validation
**Joi** for signup/login/note bodies and query params.

### 6.5 Logging with Pino
- One shared logger. `pino-http` logs every request/response with a request id.
- Redact: `req.headers.cookie`, `req.headers.authorization`, `password`.
- Levels: `info` events/user activity, `warn` bad logins and validation failures, `error` exceptions.
- Dev: `pino-pretty`. Prod: JSON.
- Activity events: `user.signup`, `user.login`, `user.logout`, `note.created`, `note.updated`, `note.trashed`, `note.restored`, `note.deleted_permanently`, `note.shared`, `note.share_revoked`.

### 6.6 Global exception handling
- `AppError(message, statusCode, code)`, `asyncHandler`, `notFound`, `errorHandler` (last middleware, logs with Pino).
- Also maps Mongoose errors: `ValidationError` → 400, duplicate key (`11000`) → 409, `CastError` (bad ObjectId) → 400, JWT errors → 401.
- Consistent response:

```json
{ "success": false, "error": { "code": "NOTE_NOT_FOUND", "message": "Note not found" } }
```

- No stack traces in production responses. Process-level `unhandledRejection` / `uncaughtException` logging.

---

## 7. Frontend approach

| Area | Decision |
|---|---|
| Build tool | Vite (`react-ts` template) |
| Language | **TypeScript** (strict props, event types, API interfaces) |
| Routing | React Router v6 |
| HTTP | axios (`withCredentials: true`, typed error/response interceptor) |
| State | Context API (Auth, Theme) with typed state & dispatch |
| Editor | **TipTap** (`@tiptap/react`, `@tiptap/starter-kit`) |
| Styling | **Tailwind CSS** with `darkMode: "class"` |
| Sanitizing | DOMPurify on every place HTML is rendered (dashboard preview, shared page) |

Screens:

1. **Login / Signup**
2. **Dashboard**: search bar, tag/color filters, pinned notes on top, "New note"
3. **Note Editor page** `/notes/:id`: title, TipTap editor, tags, color, pin, share, autosave status, Save / Cancel
4. **Trash**: restore / delete permanently, shows days remaining
5. **Profile**: user details, logout, theme toggle
6. **Shared note page** `/s/:token`: public, read-only, no login

Autosave: debounced (about 1.5 s after last keystroke), status shows "Saving…" / "Saved" / "Error, retrying", and a "unsaved changes" warning when leaving.

Dark mode: toggle in navbar/profile, saved in localStorage, defaults to the OS preference.

---

## 8. Testing strategy

**Backend (Mocha + Chai + TypeScript):** `mocha`, `chai`, `sinon` (stub Mongoose models and repositories), `supertest`, `c8` for coverage with `ts-node` / `tsx`. Optional: `mongodb-memory-server` for integration tests.

**Frontend (Jest + React Testing Library + ts-jest):** `jest`, `ts-jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`, plus CSS/asset mock. TipTap is mocked in unit tests.

**Coverage target:** at least 70 to 80 percent on critical code, exported as LCOV for SonarQube.

---

## 9. SonarQube + Git (Windows)

**SonarQube:** run SonarQube Community in Docker (give Docker Desktop at least 4 GB RAM; with WSL2 you may need `vm.max_map_count` raised). Scanner via `sonar-scanner` or the scanner Docker image. Feed it LCOV from both Mocha (c8) and Jest.

**Git:** `main` (stable / tracks upstream) ← `develop` (integration) ← `feature/*`. Feature branches opened via PR. Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`). Several small commits per task.

**CodeRabbit Compliance:**
- All variables, function parameters, and return types strictly typed (avoids `Flag missing TypeScript types as HIGH`).
- All async operations wrapped in proper try/catch or typed `asyncHandler` (avoids `Flag async/await without try-catch as MEDIUM`).
- All React components have typed prop interfaces (avoids `Check React component structure and missing prop validation`).

---

## 10. Suggestions (included in the tasks)

1. Logger and error handling are built before features.
2. `app.ts` is separate from `server.ts` so supertest works without a port.
3. Tests are written inside each feature task.
4. `.env.example` committed, `.env` never.
5. `helmet`, `cors`, `express-rate-limit`, `cookie-parser` for baseline security.
6. ESLint + Prettier + TypeScript compiler check (`tsc --noEmit`) from day one.
7. Request id on every log line.
8. README at the end with setup, env vars, API table, test and Sonar steps.
9. Extras are added one branch at a time, after the required features are done.

---

## 11. Definition of "done"

- [ ] Sign up, log in, log out (httpOnly cookie)
- [ ] Notes CRUD, private per user, rich text, sanitized
- [ ] Soft delete + Trash + restore + 30-day auto delete
- [ ] Pino logs requests, responses, errors, user activity
- [ ] Global error middleware with consistent errors
- [ ] TypeScript strict mode enabled across backend and frontend (`tsc --noEmit` clean)
- [ ] Mocha tests (controllers, services, repositories, middleware)
- [ ] Jest tests (key components)
- [ ] SonarQube scan with no blocker/critical issues
- [ ] CodeRabbit review has **0 HIGH / CRITICAL** issues
- [ ] Search & filter, Profile
- [ ] Pin + tags + colors, autosave, dark mode, public share link
- [ ] Clean git history: feature branches + PRs merged
- [ ] README complete
- [ ] (Stretch) AI summary
