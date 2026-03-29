# Trello Clone — Kanban Board

A full-stack Kanban-style project management app: *Express* REST API with *Supabase (PostgreSQL), and a **React (Vite)* single-page client with drag-and-drop boards, lists, and cards.

---

## Features

- *Boards* — create, list, search, open by id  
- *Lists* — create, rename, delete, horizontal reorder (drag-and-drop)  
- *Cards* — create, move between lists, reorder within a list, edit details (title, description, due date)  
- *Card details* — labels, members, checklists  
- *Search & filter* — cards by title, label, member, due date  

Authentication is omitted for the demo; the UI assumes a single default user context.

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite 8, React Router, TanStack Query, @dnd-kit |
| Backend  | Node.js, Express 5 |
| Database | PostgreSQL via Supabase |

---

## Repository layout


trello-backend/
├── server.js              # HTTP server entry
├── src/
│   ├── app.js             # Express app & route mounting
│   ├── config/            # Supabase client
│   ├── controllers/
│   ├── routes/
│   └── services/
└── frontend/              # Vite + React SPA
    ├── src/
    │   ├── api/           # API client
    │   ├── components/
    │   └── pages/
    └── ...


---

## Prerequisites

- *Node.js* 18+ (recommended 20 LTS)  
- *npm*  
- A *Supabase* project with tables matching your schema (boards, lists, cards, labels, members, junction tables, etc.)

---

## Backend setup

1. Install dependencies:

   bash
   npm install
   

2. Create a .env file in the project root (same folder as server.js):

   | Variable        | Description |
   |----------------|-------------|
   | SUPABASE_URL | Supabase project URL |
   | SUPABASE_KEY | Supabase service role or anon key (per your RLS policy) |
   | PORT         | Optional; defaults to 5000 |

3. Start the API:

   bash
   node server.js
   

   The server listens on PORT (or 5000).

---

## Frontend setup

1. Install dependencies:

   bash
   cd frontend
   npm install
   

2. Configure the API base URL (optional):

   | Variable        | Description |
   |----------------|-------------|
   | VITE_API_URL | Base URL of the Express API (no trailing slash) |

   Copy frontend/.env.example to frontend/.env and adjust if needed.  
   If unset, the client falls back to the default in src/api/client.js (set this for your deployed API).

3. Development server:

   bash
   npm run dev
   

   Opens the Vite dev server (typically http://localhost:5173).

4. Production build:

   bash
   npm run build
   npm run preview   # optional local preview of dist/
   

---

## Deploying

- *Backend* — e.g. [Render](https://render.com): set SUPABASE_URL, SUPABASE_KEY, and PORT (Render injects PORT automatically).  
- *Frontend* — e.g. Vercel/Netlify/Cloudflare Pages: set VITE_API_URL to your public API URL at build time, and ensure CORS on the API allows your frontend origin.

---

## CORS

The API uses cors() with default settings. For production, restrict origin to your real frontend URL instead of wide-open access.

---

## API overview (REST)

Base path: root of your API host (https://trello-demo-exeg.onrender.com).

| Area | Examples |
|------|----------|
| Boards | GET/POST /boards, GET /boards/:id, GET /boards/search |
| Lists | POST /lists, PATCH /lists/reorder, PATCH /lists/:id, DELETE /lists/:id |
| Cards | POST /cards, PATCH /cards/move, PATCH /cards/:id, DELETE /cards/:id, GET /cards/search |
| Card details | GET /card-details/:id, labels/members/checklists under /card-details/... |
| Meta | GET /meta/labels, GET /meta/members |

Responses use JSON with { success, data, message? } where applicable.

---

## License
