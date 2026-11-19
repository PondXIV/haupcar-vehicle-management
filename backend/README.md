# Backend REST API

## Setup

1. Copy `.env.example` to `.env` and set `PGPASSWORD` to the password for your PostgreSQL user.
2. Create the database configured by `PGDATABASE` (default: `haupcar_vehicle_management`).
3. Install dependencies with `npm install`.
4. Start the API with `npm run dev` or `npm start`.

The `folders` table is created automatically when the server starts.

## Project structure

- `src/controllers/foldersController.js` — folder CRUD request handlers and validation
- `src/models/foldersModel.js` — folder database queries
- `src/services/foldersService.js` — folder operations between the controller and model
- `src/routes/folders.js` — folder endpoint definitions
- `src/db.js` — PostgreSQL connection pool and database initialization

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
