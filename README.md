# ClinicConnect — Channeling Center Management System

A web app for managing a medical channeling center's day-to-day operations: doctors, patients, medicine inventory, billing, and admin/role management.

This repo is the **frontend** (React + Vite). It talks to a separate Express/MongoDB backend — see [Backend](#backend) below.

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4** for layout/utility styling
- **MUI (Material UI) 7** + **MUI X Data Grid** for tables, forms, and inputs, themed via a shared MUI theme (`src/theme.js`)
- **React Router 7**
- **Axios** for API calls
- **Lucide React** / **React Icons** for iconography

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on Vite's default port (5173, or the next free port). The app expects a backend API running at `http://localhost:5000` (see [Backend](#backend)) — without it, pages that fetch data (Doctors, Patients, Inventory, Admin) will show network errors.

### Other scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Backend

The API lives in a sibling repo: `channeling-center-management-system-backend` (Express + Mongoose/MongoDB). It needs a `.env` file with:

```
MONGO_URI=<your MongoDB connection string>
PORT=5000
```

Run it with `npm run dev` (nodemon). Note: the login endpoint currently checks a hardcoded mock admin (see below) rather than the `Admin` collection — this is a known simplification, not yet wired to real per-user authentication.

### Default login (development only)

| Email | Password |
|---|---|
| `admin@clinicconnect.com` | `ChangeMe123!` |

Change this before deploying anywhere non-local.

## Features

- **Dashboard** — landing overview page
- **Doctors** — list, add, edit, and view doctor profiles
- **Patients** — register, edit, view, and manage patient records
- **Inventory** — track medicine stock, add/edit medicines, low-stock indicators
- **Billing** — invoice list and invoice creation
- **Admin** — manage admin users and roles (register/edit roles)
- **Appointments, Reports, Settings** — placeholder pages, not yet implemented

## Project Structure

```
src/
├── api/            # Axios calls per resource (Admin, Medicine, Patient)
├── components/      # Shared UI: BackButton, TableActionButton, AddButton, SearchBar, tables/, layout/
├── context/         # React context providers (MedicineContext)
├── pages/           # Route-level pages, grouped by feature under pages/dashboard/
├── routes/          # AppRoutes.jsx — all route definitions
└── theme.js          # Shared MUI theme (colors, button/table styling)
```

## Design Conventions

- Tables use MUI `Table`/`TableContainer` with the shared `TableActionButtons` component (`src/components/TableActionButton.jsx`) — View (blue), Edit (green), Delete (red).
- Back navigation uses the shared `BackButton` component (`src/components/BackButton.jsx`) on all add/edit/view sub-pages.
- Colors/buttons are driven by the MUI theme in `src/theme.js` rather than hardcoded hex values.
