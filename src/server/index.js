const crypto = require('crypto');
const path = require('path');
const express = require('express');
const session = require('express-session');

const routes = require('./routes');
const { router: authRoutes, authenticator } = require('./auth');

const app = express();

// For handling authentication POST
app.use(express.urlencoded({ extended: false }));

// Use session middleware
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SECRET || crypto.randomBytes(32).toString('hex'),
}));

// Use authenticator middleware
app.use(authenticator);

// Serve webapp routes
app.get(/^\/(player|work|circle|tag|va)s?\/(\d+)?$/, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Serve static files from 'dist' folder
app.use(express.static('dist'));

// If 404'd, serve from 'static' folder
app.use(express.static('static'));

// Expose API routes
app.use('/api', routes);

// Expose authentication route
app.use('/auth', authRoutes);

// Start server
app.listen(process.env.PORT || 8888, () => {
  // eslint-disable-next-line no-console
  console.log(`Express listening on http://localhost:${process.env.PORT || 8888}`);
});
