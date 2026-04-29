const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TODOS_FILE))
    fs.writeFileSync(TODOS_FILE, JSON.stringify([]));
}

function readTodos() {
  ensureDataFile();
  const raw = fs.readFileSync(TODOS_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

function writeTodos(todos) {
  ensureDataFile();
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2), "utf8");
}

app.get("/todos", (req, res) => {
  try {
    const todos = readTodos();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read todos" });
  }
});

app.post("/todos", (req, res) => {
  const todo = req.body;
  if (
    !todo ||
    typeof todo.id === "undefined" ||
    typeof todo.title === "undefined"
  ) {
    return res
      .status(400)
      .json({ error: "Invalid todo payload. Expected { id, title }" });
  }

  try {
    const todos = readTodos();
    todos.push(todo);
    writeTodos(todos);
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save todo" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Todos backend listening on port ${PORT}`);
});
