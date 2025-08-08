const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all AD groups
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM ad_groups ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get AD group by id
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM ad_groups WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'AD group not found' });
    res.json(row);
  });
});

// Create new AD group
router.post('/', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const stmt = db.prepare('INSERT INTO ad_groups (name, description) VALUES (?, ?)');
  stmt.run(name, description || '', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, name, description });
  });
  stmt.finalize();
});

// Update AD group
router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const stmt = db.prepare('UPDATE ad_groups SET name = ?, description = ? WHERE id = ?');
  stmt.run(name, description || '', id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'AD group not found' });
    res.json({ id, name, description });
  });
  stmt.finalize();
});

// Delete AD group
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM ad_groups WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'AD group not found' });
    res.json({ message: 'AD group deleted' });
  });
  stmt.finalize();
});

module.exports = router;
