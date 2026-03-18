require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const sequelize  = require('./config/database');

// Import models so Sequelize registers them
require('./models/User');
require('./models/Trip');

const authRoutes      = require('./routes/auth');
const tripRoutes      = require('./routes/trips');
const generateRoutes  = require('./routes/generate');
const exportRoutes    = require('./routes/export');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/trips',     tripRoutes);
app.use('/api/generate',  generateRoutes);
app.use('/api/export',    exportRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', app: 'Roam-e-o', db: 'MySQL' })
);

// Sync MySQL tables then start server
// alter: true updates columns if schema changes without dropping data
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ MySQL tables synced');
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });