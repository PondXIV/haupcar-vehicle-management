# Haupcar Vehicle Management

Folder management project with a REST API built using Express and PostgreSQL, and a frontend built with React and Vite.

## Project Structure

- `backend/` — REST API and PostgreSQL connection
- `frontend/` — React web app

## Prerequisites

- Node.js and npm
- PostgreSQL

## Set Up and Run the Backend

1. Create a PostgreSQL database named `haupcar_vehicle_management` (or choose another name and set it in `.env`).
2. Open a terminal in the `backend` directory and install the dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your PostgreSQL user and password:

   ```dotenv
   PORT=5000
   NODE_ENV=development
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=haupcar_vehicle_management
   PGUSER=postgres
   PGPASSWORD=your_postgres_password
   ```

4. Start the API:

   ```bash
   npm run dev
   ```

   Alternatively, use `npm start` to run the server normally. The `folders` table is created automatically when the server starts.

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
