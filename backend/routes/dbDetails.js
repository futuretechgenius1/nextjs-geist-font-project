const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all database details
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM db_details ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get database detail by id
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM db_details WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Database detail not found' });
    res.json(row);
  });
});

// Create new database detail
router.post('/', authenticateToken, (req, res) => {
  const { name, type, connection_string, description } = req.body;
  if (!name || !type || !connection_string) return res.status(400).json({ error: 'Name, type, and connection string are required' });
  const stmt = db.prepare('INSERT INTO db_details (name, type, connection_string, description) VALUES (?, ?, ?, ?)');
  stmt.run(name, type, connection_string, description || '', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, name, type, connection_string, description });
  });
  stmt.finalize();
});

// Update database detail
router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, type, connection_string, description } = req.body;
  if (!name || !type || !connection_string) return res.status(400).json({ error: 'Name, type, and connection string are required' });
  const stmt = db.prepare('UPDATE db_details SET name = ?, type = ?, connection_string = ?, description = ? WHERE id = ?');
  stmt.run(name, type, connection_string, description || '', id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Database detail not found' });
    res.json({ id, name, type, connection_string, description });
  });
  stmt.finalize();
});

// Delete database detail
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM db_details WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Database detail not found' });
    res.json({ message: 'Database detail deleted' });
  });
  stmt.finalize();
});

module.exports = router;
