const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const authenticateToken = require('../middleware/authMiddleware');

// Get all config servers
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM config_servers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get config server by id
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM config_servers WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Config server not found' });
    res.json(row);
  });
});

// Create new config server
router.post('/', authenticateToken, (req, res) => {
  const { name, url, description } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
  const stmt = db.prepare('INSERT INTO config_servers (name, url, description) VALUES (?, ?, ?)');
  stmt.run(name, url, description || '', function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, name, url, description });
  });
  stmt.finalize();
});

// Update config server
router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, url, description } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
  const stmt = db.prepare('UPDATE config_servers SET name = ?, url = ?, description = ? WHERE id = ?');
  stmt.run(name, url, description || '', id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Config server not found' });
    res.json({ id, name, url, description });
  });
  stmt.finalize();
});

// Delete config server
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM config_servers WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Config server not found' });
    res.json({ message: 'Config server deleted' });
  });
  stmt.finalize();
});

module.exports = router;
