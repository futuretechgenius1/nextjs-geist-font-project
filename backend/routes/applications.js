const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all applications
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM applications ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get application by id
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM applications WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Application not found' });
    res.json(row);
  });
});

// Create new application
router.post('/', authenticateToken, (req, res) => {
  const { name, description, owner } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const stmt = db.prepare('INSERT INTO applications (name, description, owner) VALUES (?, ?, ?)');
  stmt.run(name, description || '', owner || '', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, name, description, owner });
  });
  stmt.finalize();
});

// Update application
router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, description, owner } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const stmt = db.prepare('UPDATE applications SET name = ?, description = ?, owner = ? WHERE id = ?');
  stmt.run(name, description || '', owner || '', id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Application not found' });
    res.json({ id, name, description, owner });
  });
  stmt.finalize();
});

// Delete application
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  });
  stmt.finalize();
});

module.exports = router;
