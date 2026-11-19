# Backend REST API

## Setup

1. Make sure the PostgreSQL database in `DATABASE_URL` exists.
2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string. For example:

   ```dotenv
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres?schema=public"
   ```

3. Install dependencies and generate the Prisma Client:

   ```bash
   npm install
   npm run db:generate
   ```

4. Apply migrations to the database:

   ```bash
   npm run db:deploy
   ```

5. Start the API with `npm run dev` or `npm start`.

For local schema development, use `npm run db:migrate -- --name <migration_name>`.
The server connects to the database on startup; Prisma Migrate manages the schema.
Run `npm run db:seed` to insert the initial vehicle brands and the development auth user (`Somchai`). Its password (`1234`) is stored as a bcrypt hash. This development seeder refuses to run when `NODE_ENV=production`; replace the sample credentials before deploying the application.

If `folders` and `auth_users` already exist from the previous SQL setup, do not apply the initial migration directly because it creates those tables. Verify that the existing schema matches `prisma/migrations/20261119150000_init/migration.sql`, then baseline it with:

```bash
npx prisma migrate resolve --applied 20261119150000_init
```

## Project structure

- `src/controllers/foldersController.js` — folder CRUD request handlers and validation
- `src/models/foldersModel.js` — folder queries through Prisma Client
- `src/services/foldersService.js` — folder operations between the controller and model
- `src/routes/folders.js` — folder endpoint definitions
- `src/db.js` — Prisma Client connection
- `prisma/schema.prisma` — Prisma models for folders, users, vehicle brands, and vehicles
- `prisma/migrations/` — database schema migrations

## Folder endpoints

All endpoints are prefixed with `/api/folders`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/folders` | List folders |
| `GET` | `/api/folders/:id` | Get a folder |
| `POST` | `/api/folders` | Create a folder with `{ "name": "Documents" }` |
| `PUT` | `/api/folders/:id` | Rename a folder with `{ "name": "Archive" }` |
| `DELETE` | `/api/folders/:id` | Delete a folder |

Folder responses include `id`, `name`, `created_at`, and `updated_at`.
