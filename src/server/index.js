const path = require('path');
const express = require('express');

const routes = require('./routes');

const app = express();

// Serve routes
app.get(/^\/(player|work|circle|tag|va)s?\/(\d+)?$/, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Serve static files from 'dist' folder
app.use(express.static('dist'));

// If 404'd, serve from 'static' folder
app.use(express.static('static'));

// Expose API routes
app.use('/api', routes);

// Start server
app.listen(process.env.PORT || 8888, () => {
  // eslint-disable-next-line no-console
  console.log(`Express listening on http://localhost:${process.env.PORT || 8888}`);
});
