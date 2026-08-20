# Clearwork

A small, focused task manager built for the SmartView Media full-stack technical assessment. It supports complete CRUD operations, search and status filtering, priorities, due dates, and quick completion toggles.

## Stack

- Laravel 13 / PHP 8.3+
- React 19 with strict TypeScript
- MySQL 8+
- Vite 8
- PHPUnit feature tests

## Run locally

Requirements: PHP 8.3+ with PDO MySQL, Mbstring, OpenSSL, and Fileinfo extensions; Composer; Node.js 20+; MySQL 8+.

```bash
composer install
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate

# Create the MySQL database (you will be prompted for the root password)
mysql -u root -p -e "CREATE DATABASE clearwork CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate --seed
npm install
npm run build
php artisan serve
```

If your local MySQL username, password, host, or port differs, update the corresponding `DB_*` values in `.env` before running the migration.

Open `http://127.0.0.1:8000`. For frontend hot reload, use `npm run dev` in a second terminal instead of `npm run build`.

## Verify

```bash
php artisan test
npm run typecheck
npm run build
```

## Why it is built this way

The frontend and API live in one repository so the reviewer has a straightforward Laravel app and no CORS or multi-service setup. MySQL is the application database, matching a typical production Laravel stack. PHPUnit uses an isolated in-memory SQLite database only during automated tests, keeping the suite fast and preventing test data from touching a developer's MySQL database.

The backend keeps transport concerns separate: form requests own validation, the resource defines the JSON contract, and the controller stays focused on querying and persistence. The UI uses a small typed API boundary and focused components rather than adding a state-management library for a module of this size. Search is debounced, mutations return the canonical server model, destructive actions require confirmation, and API validation is shown at field level.

Deliberate scope choices:

- Status and priority remain constrained strings instead of database enums. This keeps schema changes simple while Laravel validation enforces the allowed values.
- The API returns all matching tasks because the assessment dataset is small. Pagination would be the next change at production scale.
- There is no authentication because the requested scope is a standalone CRUD module.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/tasks` | List tasks; accepts `search` and `status` |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/{task}` | Read a task |
| `PATCH` | `/api/tasks/{task}` | Partially update a task |
| `DELETE` | `/api/tasks/{task}` | Delete a task |

## AI usage

I used OpenAI Codex for project scaffolding, implementation suggestions, test generation, and verification. I reviewed the generated code by tracing each request from the React event through the typed API client, Laravel validation/controller/resource layers, and the database. I also ran the feature suite, TypeScript compiler, production build, and manual browser checks before shipping.

One thing the AI got wrong: the first local setup command passed PHP's `extension_dir` as a separate executable argument, so PHP tried to open the extension directory as a script. I identified the bad argument grouping from the CLI error, corrected it to a single `extension_dir=...` value, and reran dependency installation. This did not affect application code, but it is a good example of why I verify generated commands rather than running them blindly.

Approximate contribution: AI produced roughly 80% of the initial code and prose; I directed the architecture and scope, reviewed 100% of the output, corrected setup/build issues, and verified the final behavior. I would not ship code I cannot explain.

## Suggested walkthrough (5–7 minutes)

1. **0:00–0:45 — Outcome:** show the task list, filters, search, and responsive layout.
2. **0:45–2:00 — CRUD:** create a task, edit it, toggle completion, then delete it.
3. **2:00–3:15 — Backend:** explain the route → form request → controller → resource → Eloquent flow.
4. **3:15–4:30 — Frontend:** explain the typed API client, local state, debounced fetching, and error states.
5. **4:30–5:30 — Detail:** walk through partial update validation in `UpdateTaskRequest` and the test that proves it.
6. **5:30–6:30 — AI:** cover the tools, contribution estimate, command issue above, and verification process.

Keep the recording natural and unedited as requested. Open the code before starting and share a link to the finished recording alongside the repository.
