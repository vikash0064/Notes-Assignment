const fs = require("fs");
const path = require("path");

const express = require("express");

const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, "notes.json");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const readNotesFromFile = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return data ? JSON.parse(data) : [];
};

const writeNotesToFile = (notes) => {
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
};

app.get("/", (req, res) => {
  const notes = readNotesFromFile();
  res.render("index", { notes });
});

// Save Note from Form
app.post("/add-note", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.send("Title & Content required");
  }
  const notes = readNotesFromFile();
  const newNote = {
    id: Date.now(),
    title,
    content,
  };

  notes.push(newNote);
  writeNotesToFile(notes);

  res.redirect("/");
});

// Support form-based delete with POST only (no method-override)
app.post("/delete-note/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  let notes = readNotesFromFile();
  notes = notes.filter((note) => note.id !== noteId);
  writeNotesToFile(notes);
  res.redirect("/");
});

// Render Edit Form
app.get("/edit-note/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const notes = readNotesFromFile();
  const note = notes.find((n) => n.id === noteId);

  if (!note) {
    return res.status(404).send("Note not found");
  }

  res.render("edit", { note });
});

app.patch("/update-note/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, content } = req.body;
  let notes = readNotesFromFile();
  const noteIndex = notes.findIndex((note) => note.id === noteId);
  if (noteIndex !== -1) {
    notes[noteIndex] = { id: noteId, title, content };
    writeNotesToFile(notes);
    return res.json({ success: true });
  }
  res.json({ success: false, error: "Note not found" });
});

// Existing POST update for form
app.post("/update-note/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, content } = req.body;
  let notes = readNotesFromFile();
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex !== -1) {
    notes[noteIndex] = { id: noteId, title, content };
    writeNotesToFile(notes);
  }

  res.redirect("/");
});

// View Note Details
app.get("/view-note/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const notes = readNotesFromFile();
  const note = notes.find((n) => n.id === noteId);

  if (!note) {
    return res.status(404).send("Note not found");
  }

  res.render("view", { note });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
