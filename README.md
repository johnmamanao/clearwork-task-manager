# Clearwork

A small, focused task manager built for the SmartView Media full-stack technical assessment. It supports complete CRUD operations, search and status filtering, priorities, due dates, and quick completion toggles.

## Stack

- Laravel 13 / PHP 8.3+
- React 19 with strict TypeScript
- MySQL 8+
- Vite 8
- PHPUnit feature tests

## Quick start with Docker

The only requirement is [Docker Desktop](https://www.docker.com/products/docker-desktop/). PHP, Composer, Node.js, and MySQL do not need to be installed separately.

```bash
git clone https://github.com/johnmamanao/clearwork-task-manager.git
cd clearwork-task-manager
docker compose up --build
```

Open `http://localhost:8000`. The first startup builds the React frontend, installs PHP dependencies, starts MySQL 8.4, runs the database migrations, and inserts sample tasks automatically.

Stop the application with `Ctrl+C`, then remove the containers:

```bash
docker compose down
```

The MySQL data persists between runs. To intentionally reset it and reload fresh sample data:

```bash
docker compose down -v
docker compose up --build
```

## Run without Docker

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

Docker Compose provides the reproducible review path: a multi-stage image installs Composer packages and compiles the React frontend, while the official MySQL image stores data in a named volume. The application waits for a healthy database, generates an ephemeral local application key, and runs repeat-safe migrations and seeding before serving requests.

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
