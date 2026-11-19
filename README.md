# Haupcar Vehicle Management

Folder management project with a REST API built using Express, Prisma, and PostgreSQL, and a frontend built with React and Vite.

## Project Structure

- `backend/` — REST API and Prisma database schema
- `frontend/` — React web app

## Prerequisites

- Node.js and npm
- PostgreSQL

## Set Up and Run the Backend

1. Ensure the PostgreSQL database configured by `DATABASE_URL` exists (default database: `postgres`; change it in `.env` if needed).
2. Open a terminal in the `backend` directory and install the dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Copy `.env.example` to `.env` and set your PostgreSQL connection string:

   ```dotenv
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres?schema=public"
   ```

4. Generate Prisma Client, apply migrations, and start the API:

   ```bash
   npm run db:generate
   npm run db:deploy
   npm run dev
   ```

   Alternatively, use `npm start` to run the server normally. Prisma Migrate manages the database schema.

## Set Up and Run the Frontend

Open another terminal in the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Run `npm run build` to create a production build, or `npm run lint` to run the linter.

## Folder API

Base path: `http://localhost:5000/api/folders`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | List folders |
| `GET` | `/:id` | Get a folder by ID |
| `POST` | `/` | Create a folder, e.g. `{ "name": "Documents" }` |
| `PUT` | `/:id` | Rename a folder, e.g. `{ "name": "Archive" }` |
| `DELETE` | `/:id` | Delete a folder |

Run `npm test` from the `backend` directory to test the backend.
