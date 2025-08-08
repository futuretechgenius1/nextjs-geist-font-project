require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const applicationsRoutes = require('./routes/applications');
const configServersRoutes = require('./routes/configServers');
const adGroupsRoutes = require('./routes/adGroups');
const confluencePagesRoutes = require('./routes/confluencePages');
const dbDetailsRoutes = require('./routes/dbDetails');

const { initializeDatabase } = require('./database/db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and tables
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/config-servers', configServersRoutes);
app.use('/api/ad-groups', adGroupsRoutes);
app.use('/api/confluence-pages', confluencePagesRoutes);
app.use('/api/db-details', dbDetailsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
