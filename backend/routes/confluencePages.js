const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all confluence pages
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM confluence_pages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get confluence page by id
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM confluence_pages WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Confluence page not found' });
    res.json(row);
  });
});

// Create new confluence page
router.post('/', authenticateToken, (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Title and URL are required' });
  const stmt = db.prepare('INSERT INTO confluence_pages (title, url, description) VALUES (?, ?, ?)');
  stmt.run(title, url, description || '', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, title, url, description });
  });
  stmt.finalize();
});

// Update confluence page
router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { title, url, description } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Title and URL are required' });
  const stmt = db.prepare('UPDATE confluence_pages SET title = ?, url = ?, description = ? WHERE id = ?');
  stmt.run(title, url, description || '', id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Confluence page not found' });
    res.json({ id, title, url, description });
  });
  stmt.finalize();
});

// Delete confluence page
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM confluence_pages WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Confluence page not found' });
    res.json({ message: 'Confluence page deleted' });
  });
  stmt.finalize();
});

module.exports = router;
