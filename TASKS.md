# Notes App — Task List (MERN with TypeScript)

## Rules

1. **One task at a time.** Only the task marked `🟡 IN PROGRESS` is worked on.
2. Every task has its **own branch** and ends with a **Pull Request into `develop`** on GitHub.
3. **The next task starts only when you say "go"** (or "go T<n>"). Until then it stays `⬜ LOCKED`.
4. Make **several small commits** per task, not one big commit.
5. Tests and TypeScript types are written **inside the same task** as the feature.
6. **CodeRabbit rule**: Ensure zero `HIGH` (missing TypeScript types) and zero `MEDIUM` (unhandled async) issues on PRs.

Status legend: `⬜ LOCKED` · `🟡 IN PROGRESS` · `✅ DONE` · `⏭ SKIPPED`

---

## Git workflow (Windows PowerShell, use for every task)

```powershell
# start a task
git checkout develop
git pull origin develop
git checkout -b feature/<branch-name>

# while working (small commits)
git add .
git commit -m "feat: short message"

# finish a task
git push -u origin feature/<branch-name>
# then on GitHub: Open Pull Request  feature/<branch-name>  ->  develop
# review it, wait for CodeRabbit, click "Merge pull request"
git checkout develop
git pull origin develop
git branch -d feature/<branch-name>
```

Commit prefixes: `feat` · `fix` · `test` · `docs` · `chore` · `refactor`

---

## Progress overview

| ID | Task | Branch | Status |
|----|------|--------|--------|
| T0 | Repo, Docker & project setup | `chore/project-setup` | 🟡 IN PROGRESS (PR #1 open) |
| T1 | Backend skeleton + Pino logger (TS) | `feature/backend-skeleton-logging` | ✅ DONE |
| T2 | Global exception handling (TS) | `feature/global-error-handling` | ✅ DONE |
| T3 | MongoDB connection + models (TS) | `feature/mongodb-models` | 🟡 IN PROGRESS (next up) |
| T4 | Auth backend (httpOnly cookie) | `feature/auth-backend` | ⬜ LOCKED |
| T5 | Notes CRUD + soft delete backend | `feature/notes-crud-backend` | ⬜ LOCKED |
| T6 | Backend unit tests (Mocha/Chai/TS) | `test/backend-unit-tests` | ⬜ LOCKED |
| T7 | Frontend scaffold (Vite + React + TS + Tailwind) | `feature/frontend-scaffold` | ⬜ LOCKED |
| T8 | Auth UI (signup/login) | `feature/auth-ui` | ⬜ LOCKED |
| T9 | Dashboard (notes list) | `feature/dashboard` | ⬜ LOCKED |
| T10 | Note editor (TipTap + TS) | `feature/note-editor` | ⬜ LOCKED |
| T11 | Trash page (restore / delete forever) | `feature/trash-page` | ⬜ LOCKED |
| T12 | User profile + logout | `feature/user-profile` | ⬜ LOCKED |
| T13 | Frontend unit tests (Jest + ts-jest) | `test/frontend-unit-tests` | ⬜ LOCKED |
| T14 | SonarQube integration | `chore/sonarqube` | ⬜ LOCKED |
| T15 | Search & filter | `feature/search-filter` | ⬜ LOCKED |
| T16 | Pin + tags + colors | `feature/pin-tags-colors` | ⬜ LOCKED |
| T17 | Autosave + dark mode | `feature/autosave-dark-mode` | ⬜ LOCKED |
| T18 | Public share link | `feature/public-share-link` | ⬜ LOCKED |
| T19 | Tests for extras + Sonar re-scan | `test/extras-and-sonar-rescan` | ⬜ LOCKED |
| T20 | Documentation + final release | `docs/readme-and-release` | ⬜ LOCKED |
| T21 | AI note summary (stretch) | `feature/ai-summary` | ⬜ LOCKED |

**Phases:** T0–T6 backend foundation and API · T7–T13 frontend and tests · T14 quality gate · T15–T19 standout features · T20 release · T21 stretch.

---

## T0 — Repo, Docker & project setup
**Branch:** `chore/project-setup`

- [x] Save initial docs on `main`, push to GitHub fork
- [x] Create `develop` from `main`, push it, set as working base
- [x] Create folders `backend/` and `frontend/`
- [x] Root `.gitignore`: `node_modules`, `.env`, `logs`, `coverage`, `dist`, `build`
- [x] `docker-compose.yml` with MongoDB (volume for data)
- [ ] Verify Docker Desktop (WSL2) works: `docker compose up -d` then check Mongo is running
- [x] ESLint + Prettier config at repo root with TypeScript support
- [ ] Open your **first PR** `chore/project-setup` → `develop` and merge it

**Commits:** `chore: init repository and docs` · `chore: add gitignore and folder structure` · `chore: add docker compose for mongodb` · `chore: add eslint and prettier`
**Done when:** `develop` exists on GitHub, Mongo container runs, first PR is merged.

---

## T1 — Backend skeleton + Pino logger (TypeScript)
**Branch:** `feature/backend-skeleton-logging`

- [x] `npm init` in `backend/`; install `express dotenv cors helmet cookie-parser pino pino-http pino-pretty`
- [x] Install TypeScript & types: `typescript tsx @types/node @types/express @types/cors @types/cookie-parser @types/pino-http`
- [x] Backend `tsconfig.json` (strict: true, es2022/NodeNext)
- [x] `src/app.ts` and `src/server.ts` (separate)
- [x] `src/config/env.ts` + `.env.example`
- [x] `src/logger/index.ts` (levels, redaction of cookie/authorization/password)
- [x] `pino-http` middleware (typed request + response logs, request id)
- [x] CORS with `credentials: true` and the frontend origin
- [x] `GET /api/health`
- [x] Graceful shutdown logging

**Commits:** `chore: init backend with typescript` · `feat: express app and server` · `feat: pino logger` · `feat: http request logging`
**Done when:** `npm run dev` starts via `tsx`, `/api/health` returns 200, requests show in logs.

---

## T2 — Global exception handling (TypeScript)
**Branch:** `feature/global-error-handling`

- [x] `utils/AppError.ts`, `utils/asyncHandler.ts` (strictly typed with `Request`, `Response`, `NextFunction`)
- [x] `middleware/notFound.ts` (404)
- [x] `middleware/errorHandler.ts` (logs with Pino, consistent JSON, no stack in prod)
- [x] Map Mongoose `ValidationError`, duplicate key `11000`, `CastError`, JWT errors
- [x] Process-level `unhandledRejection` / `uncaughtException` logging
- [x] Temporary test route that throws, to prove it works

**Commits:** `feat: AppError and asyncHandler` · `feat: notFound and error handler` · `feat: map mongoose and jwt errors` · `feat: process level error logging`
**Done when:** any thrown error returns the standard JSON and appears as an `error` log.

---

## T3 — MongoDB connection + models (TypeScript)
**Branch:** `feature/mongodb-models`

- [ ] Install `mongoose @types/mongoose`; `config/db.ts` connecting to the Docker Mongo
- [ ] Log connection success / failure / disconnect
- [ ] `models/User.ts` (IUser interface, schema, name, email unique, passwordHash `select:false`, timestamps)
- [ ] `models/Note.ts` (INote interface, schema, user, title, content, plainText, pinned, color, tags, shareToken, isShared, deletedAt, timestamps)
- [ ] Indexes from PROJECT_PLAN §5, including the **30-day TTL index on `deletedAt`**
- [ ] Health check reports DB status

**Commits:** `feat: mongoose connection` · `feat: user model and interfaces` · `feat: note model with indexes` · `feat: db status in health check`
**Done when:** app connects on startup and both collections/indexes are created.

---

## T4 — Auth backend (httpOnly cookie)
**Branch:** `feature/auth-backend`

- [ ] `types/auth.ts` and Express Request type augmentation (`req.user`)
- [ ] `repositories/userRepository.ts`
- [ ] `services/authService.ts` (bcrypt hash/verify, sign JWT)
- [ ] `controllers/authController.ts`
- [ ] Joi / Zod validation middleware for signup/login
- [ ] Set JWT in **httpOnly cookie** (`SameSite=Lax`, `Secure` in prod); logout clears it
- [ ] `middleware/auth.ts` (reads cookie, verifies JWT, sets `req.user`)
- [ ] Routes: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /users/me`
- [ ] Log `user.signup`, `user.login`, `user.logout`; failed login as `warn`
- [ ] Rate limit on login/signup

**Commits:** `feat: user repository` · `feat: auth service` · `feat: auth controller and routes` · `feat: cookie jwt middleware` · `feat: validation and rate limit`
**Done when:** signup → login → `/users/me` works (Postman/curl) with the cookie.

---

## T5 — Notes CRUD + soft delete backend
**Branch:** `feature/notes-crud-backend`

- [ ] `types/note.ts` (CreateNoteDTO, UpdateNoteDTO, NoteFilterQuery)
- [ ] `repositories/noteRepository.ts` (every query filtered by `user`)
- [ ] `services/noteService.ts` (ownership checks, `plainText` generation from HTML)
- [ ] `controllers/noteController.ts` + validation
- [ ] Routes: `GET /notes`, `GET /notes/:id`, `POST /notes`, `PUT /notes/:id`
- [ ] **Soft delete:** `DELETE /notes/:id` sets `deletedAt`
- [ ] `GET /notes/trash`, `POST /notes/:id/restore`, `DELETE /notes/:id/permanent`
- [ ] Active list excludes trashed notes
- [ ] Log `note.created`, `note.updated`, `note.trashed`, `note.restored`, `note.deleted_permanently`

**Commits:** `feat: note repository` · `feat: note service` · `feat: note controller and routes` · `feat: soft delete and trash endpoints` · `feat: note validation`
**Done when:** a user can CRUD, trash, restore their notes and cannot touch anyone else's.

---

## T6 — Backend unit tests (Mocha/Chai/TypeScript)
**Branch:** `test/backend-unit-tests`

- [ ] Install `mocha chai sinon supertest c8 ts-node @types/mocha @types/chai @types/sinon @types/supertest`
- [ ] Repository tests (stubbed Mongoose models)
- [ ] Service tests (stubbed repositories)
- [ ] Controller tests (stubbed services)
- [ ] Middleware tests (auth, errorHandler, notFound)
- [ ] `npm test` and `npm run coverage` (LCOV output)
- [ ] Coverage at least 70 percent

**Commits:** `test: repository tests` · `test: service tests` · `test: controller tests` · `test: middleware tests` · `chore: coverage config`
**Done when:** all tests pass and a coverage report is generated.

---

## T7 — Frontend scaffold (Vite + React + TypeScript + Tailwind)
**Branch:** `feature/frontend-scaffold`

- [ ] Create React TypeScript app with Vite in `frontend/` (`template: react-ts`)
- [ ] Install and configure **Tailwind** (`darkMode: "class"`)
- [ ] Install `react-router-dom axios @types/react-router-dom`
- [ ] Folder structure (`api`, `types`, `context`, `components`, `pages`, `routes`, `hooks`)
- [ ] Typed axios instance (`withCredentials: true`, typed error interceptor)
- [ ] Route placeholders: `/login`, `/signup`, `/`, `/notes/new`, `/notes/:id`, `/trash`, `/profile`, `/s/:token`
- [ ] Base layout + navbar
- [ ] Verify `npm run build` (`tsc && vite build`) succeeds without type errors

**Commits:** `chore: init react app with vite and typescript` · `chore: add tailwind` · `feat: routing` · `feat: axios instance` · `feat: base layout`
**Done when:** app runs, Tailwind styles apply, navigation works, `tsc` passes.

---

## T8 — Auth UI
**Branch:** `feature/auth-ui`

- [ ] `AuthContext` (user state, login, signup, logout, "who am I" check on load)
- [ ] Signup form with validation + error messages
- [ ] Login form with validation + error messages
- [ ] `ProtectedRoute`
- [ ] Redirect to dashboard after login

**Commits:** `feat: auth context` · `feat: signup page` · `feat: login page` · `feat: protected route`
**Done when:** signup → login → dashboard works against the real API, and a page refresh keeps you logged in.

---

## T9 — Dashboard
**Branch:** `feature/dashboard`

- [ ] Fetch the logged-in user's notes
- [ ] `NoteCard` / `NoteList` (sanitized preview with DOMPurify)
- [ ] "New note" button → editor
- [ ] Delete → moves to Trash (with toast/undo message)
- [ ] Loading, empty and error states

**Commits:** `feat: notes api module` · `feat: note list and card` · `feat: move note to trash` · `feat: empty and error states`
**Done when:** dashboard shows only my active notes and delete moves them to Trash.

---

## T10 — Note editor (TipTap)
**Branch:** `feature/note-editor`

- [ ] Install `@tiptap/react @tiptap/starter-kit`
- [ ] `NoteEditor` as a reusable component (so a modal is easy later)
- [ ] Toolbar: bold, italic, headings, lists, code, undo/redo
- [ ] Page `/notes/new` and `/notes/:id`: title + editor + Save / Cancel
- [ ] Create new note, load and edit existing note
- [ ] Sanitize HTML on display
- [ ] Return to dashboard after save/cancel

**Commits:** `feat: tiptap editor component` · `feat: editor toolbar` · `feat: create note` · `feat: edit note` · `fix: sanitize note html`
**Done when:** create and edit with formatting persist correctly.

---

## T11 — Trash page
**Branch:** `feature/trash-page`

- [ ] `/trash` page listing trashed notes
- [ ] Show "deleted X days ago, removed in Y days"
- [ ] Restore button
- [ ] Delete permanently button (confirmation)
- [ ] Navbar link to Trash

**Commits:** `feat: trash page` · `feat: restore note` · `feat: delete permanently`
**Done when:** you can restore a note back to the dashboard or remove it forever.

---

## T12 — User profile + logout
**Branch:** `feature/user-profile`

- [ ] Profile page (name, email, joined date, note count)
- [ ] Logout button (calls API, clears state, redirects)
- [ ] Navbar shows user name

**Commits:** `feat: profile page` · `feat: logout`
**Done when:** profile shows details and logout returns to login.

---

## T13 — Frontend unit tests (Jest + ts-jest)
**Branch:** `test/frontend-unit-tests`

- [ ] Configure Jest + ts-jest + React Testing Library + jsdom (+ CSS/asset mock)
- [ ] Tests: Login form, Signup form
- [ ] Tests: ProtectedRoute
- [ ] Tests: NoteList / NoteCard
- [ ] Tests: NoteEditor (TipTap mocked), Trash page
- [ ] Tests: AuthContext and API module (mocked)
- [ ] Coverage report (LCOV)

**Commits:** `chore: jest and ts-jest config` · `test: auth forms` · `test: protected route` · `test: notes components` · `test: auth context`
**Done when:** `npm test` passes with coverage output.

---

## T14 — SonarQube integration
**Branch:** `chore/sonarqube`

- [ ] Add SonarQube service to `docker-compose.yml` (give Docker Desktop at least 4 GB RAM)
- [ ] Log in, create project + token
- [ ] `sonar-project.properties` (sources, tests, exclusions, LCOV paths for backend and frontend)
- [ ] Run the scanner, review the report
- [ ] Fix bugs, vulnerabilities, security hotspots, major code smells
- [ ] Add `sonar` npm script and document steps
- [ ] Save before/after screenshots

**Commits:** `chore: sonarqube docker service` · `chore: sonar config` · `fix: sonar bugs and vulnerabilities` · `refactor: sonar code smells` · `docs: sonar instructions`
**Done when:** quality gate passes with no blocker/critical issues.

---

## T15 — Search & filter
**Branch:** `feature/search-filter`

- [ ] Backend: `GET /notes?search=&sort=` using the text index
- [ ] Frontend: debounced search bar, sort dropdown
- [ ] Empty "no results" state
- [ ] Tests (Mocha + Jest)

**Commits:** `feat: backend search` · `feat: search ui` · `test: search`

---

## T16 — Pin + tags + colors
**Branch:** `feature/pin-tags-colors`

- [ ] Backend: `PATCH /notes/:id/pin`, tags and color on create/update, `GET /tags`
- [ ] Filters: `?tag=&color=&pinned=`
- [ ] Frontend: pin icon (pinned notes shown first), tag input with chips, color picker, tag/color filters
- [ ] Tests

**Commits:** `feat: pin note api` · `feat: tags and color api` · `feat: pin ui` · `feat: tags and color ui` · `test: pin tags colors`

---

## T17 — Autosave + dark mode
**Branch:** `feature/autosave-dark-mode`

- [ ] `useDebounce` and `useAutosave` hooks (save about 1.5 s after typing stops)
- [ ] Save status indicator: Saving… / Saved / Error
- [ ] Warn on leaving with unsaved changes
- [ ] `ThemeContext`, toggle in navbar/profile, saved in localStorage, defaults to OS preference
- [ ] Tailwind `dark:` styles across all pages
- [ ] Tests for the hooks and theme toggle

**Commits:** `feat: autosave hook` · `feat: save status indicator` · `feat: theme context and toggle` · `style: dark mode styles` · `test: autosave and theme`

---

## T18 — Public share link
**Branch:** `feature/public-share-link`

- [ ] Backend: `POST /notes/:id/share` (random token), `DELETE /notes/:id/share` (revoke)
- [ ] Public `GET /api/public/notes/:token` returns only safe fields (title, sanitized content, updatedAt, author name)
- [ ] Trashed notes and revoked links return 404
- [ ] Rate limit the public route
- [ ] Frontend: Share button in editor, copy-link, revoke; public page `/s/:token` (read-only, no login)
- [ ] Log `note.shared`, `note.share_revoked`
- [ ] Tests

**Commits:** `feat: share token api` · `feat: public note endpoint` · `feat: share ui` · `feat: shared note page` · `test: share link`

---

## T19 — Tests for extras + Sonar re-scan
**Branch:** `test/extras-and-sonar-rescan`

- [ ] Fill any coverage gaps from T15 to T18
- [ ] Re-run SonarQube, fix new issues
- [ ] Confirm quality gate still passes

**Commits:** `test: close coverage gaps` · `fix: sonar issues after extras`

---

## T20 — Documentation + final release
**Branch:** `docs/readme-and-release`

- [ ] README: overview, features, setup on Windows, env vars, scripts, API table, screenshots
- [ ] How to run tests and SonarQube
- [ ] Open PR `docs/readme-and-release` → `develop` and merge it
- [ ] Open release PR `develop` → `main` and merge
- [ ] Tag `v1.0.0` on `main`

**Commits:** `docs: readme` · `docs: api reference` · `chore: release v1.0.0`
**Done when:** a new person can clone, follow the README, and run the app.

---

## T21 — AI note summary (stretch, only if you finish early)
**Branch:** `feature/ai-summary`

- [ ] Backend: `POST /notes/:id/summary` calls the Claude API (key in `.env`, never in the frontend)
- [ ] Rate limit + log usage, handle API errors with the global error handler
- [ ] Frontend: "Summarize" button in the editor, shows the summary in a panel
- [ ] Tests with the API call stubbed

**Commits:** `feat: summary endpoint` · `feat: summarize button` · `test: ai summary`

---

## Unlock commands

- **"go"** → the next `⬜ LOCKED` task becomes `🟡 IN PROGRESS`
- **"go T<number>"** → jump to a specific task
- **"skip T<number>"** → mark a task as skipped
