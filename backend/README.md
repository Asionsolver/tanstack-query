# Todos Backend

Simple Express backend for the Todos example.

Endpoints

- `GET /todos` — returns an array of todos
- `POST /todos` — accepts `{ id, title }` and appends to the list

Run locally

```bash
cd backend
npm install
npm start
# server runs on http://localhost:4000
```

Notes

- Data is stored in `data/todos.json` (file-based, simple persistence).
- CORS is enabled so the frontend can call the API from another origin.
