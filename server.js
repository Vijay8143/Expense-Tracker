const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files serving with cache control
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Disable caching during development
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// API endpoints
app.get('/api/expenses', (req, res) => {
  try {
    const expenses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'expenses.json')));
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load expenses' });
  }
});

app.post('/api/expenses', (req, res) => {
  try {
    const newExpense = req.body;
    const expenses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'expenses.json')));
    expenses.push({
      id: Date.now(),
      ...newExpense,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(path.join(__dirname, 'data', 'expenses.json'), JSON.stringify(expenses, null, 2));
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// Database initialization
function initializeDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const expensesFile = path.join(dataDir, 'expenses.json');
  if (!fs.existsSync(expensesFile)) {
    fs.writeFileSync(expensesFile, '[]');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// History API Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server startup
initializeDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- GET  /api/expenses`);
  console.log(`- POST /api/expenses`);
});